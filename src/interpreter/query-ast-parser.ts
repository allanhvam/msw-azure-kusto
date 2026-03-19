import * as antlr from 'antlr4ng';
import { KqlLexer } from '../parser/KqlLexer.js';
import type {
  EntityNameReferenceContext,
  ManagementCommandExpressionContext,
  ManagementDropTableBodyContext,
  ManagementGenericBodyContext,
  ManagementIngestFromUriBodyContext,
  ManagementIngestInlineBodyContext,
  ManagementShowBodyContext,
  ManagementTableTargetBodyContext,
  ManagementTableWithSchemaBodyContext,
  NamedExpressionContext,
  OrderedExpressionContext,
  ParenthesizedExpressionContext,
  PipeExpressionContext,
  QueryStatementContext,
  RelaxedQueryOperatorParameterContext,
  StatementContext,
  UnionOperatorExpressionContext,
  UnnamedExpressionContext,
  WildcardedEntityExpressionContext} from '../parser/KqlParser.js';
import {
  KqlParser,
} from '../parser/KqlParser.js';
import { KqlVisitor } from '../parser/KqlVisitor.js';
import type { KustoRow } from './types.js';

export type QueryAstParserOptions = {
  normalizeName: (name: string) => string;
};

export function getStatementPipeExpression(statement: StatementContext): PipeExpressionContext {
  const queryStatement = statement.queryStatement();
  if (!queryStatement) {
    throw new Error('Only query statements are supported.');
  }

  return queryStatement.expression().pipeExpression();
}

export function getQueryStatementPipeExpression(queryStatement: QueryStatementContext): PipeExpressionContext {
  return queryStatement.expression().pipeExpression();
}

type ManagementBodyFields = {
  tableName: string | null;
  schemaText: string | null;
  argumentTokens: string[];
  argumentsText: string;
  fromQueryPayload: string | null;
};

const defaultBodyFields: ManagementBodyFields = {
  tableName: null,
  schemaText: null,
  argumentTokens: [],
  argumentsText: '',
  fromQueryPayload: null,
};

class ManagementCommandBodyExtractor extends KqlVisitor<ManagementBodyFields> {
  private readonly rawCommand: string;

  constructor(rawCommand: string) {
    super();
    this.rawCommand = rawCommand;
  }

  protected defaultResult(): ManagementBodyFields {
    return { ...defaultBodyFields };
  }

  visitManagementTableWithSchemaBody = (ctx: ManagementTableWithSchemaBodyContext): ManagementBodyFields => ({
    ...defaultBodyFields,
    tableName: ctx.managementCommandIdentifier().getText(),
    schemaText: ctx.managementSchemaText().getText(),
    argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
  });

  visitManagementDropTableBody = (ctx: ManagementDropTableBodyContext): ManagementBodyFields => {
    const identifiers = ctx.managementCommandIdentifier();
    return {
      ...defaultBodyFields,
      tableName: identifiers[0]?.getText() ?? null,
      argumentTokens: identifiers.slice(1).map((id) => id.getText().toLowerCase()),
      argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
    };
  };

  visitManagementTableTargetBody = (ctx: ManagementTableTargetBodyContext): ManagementBodyFields => ({
    ...defaultBodyFields,
    tableName: ctx.managementCommandIdentifier().getText(),
    argumentTokens: ctx.managementCommandToken().map((token) => token.getText().toLowerCase()),
    argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
  });

  visitManagementShowBody = (ctx: ManagementShowBodyContext): ManagementBodyFields => ({
    ...defaultBodyFields,
    argumentTokens: [ctx.getText().toLowerCase()],
    argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
  });

  visitManagementIngestInlineBody = (ctx: ManagementIngestInlineBodyContext): ManagementBodyFields => ({
    ...defaultBodyFields,
    tableName: ctx._TableName?.getText() ?? null,
    argumentTokens: [ctx._InlineKeyword?.getText().toLowerCase() ?? 'inline'],
    fromQueryPayload: getTextFromTokenRange(this.rawCommand, ctx.managementFromQueryPayload()),
    argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
  });

  visitManagementIngestFromUriBody = (ctx: ManagementIngestFromUriBodyContext): ManagementBodyFields => ({
    ...defaultBodyFields,
    tableName: ctx._TableName?.getText() ?? null,
    argumentTokens: ['uri'],
    fromQueryPayload: getTextFromTokenRange(this.rawCommand, ctx.managementIngestSourceText()),
    argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
  });

  visitManagementGenericBody = (ctx: ManagementGenericBodyContext): ManagementBodyFields => ({
    ...defaultBodyFields,
    argumentTokens: ctx.managementCommandToken().map((token) => token.getText().toLowerCase()),
    argumentsText: getTextFromTokenRange(this.rawCommand, ctx),
  });
}

export function extractManagementCommandFields(ctx: ManagementCommandExpressionContext, rawCommand: string) {
  const commandName = ctx.managementCommandName().getText().toLowerCase();
  const body = ctx.managementCommandBody();
  const extractor = new ManagementCommandBodyExtractor(rawCommand);
  const fields = body ? extractor.visit(body) ?? defaultBodyFields : defaultBodyFields;

  return { command: rawCommand, commandName, ...fields };
}

function getTextFromTokenRange(
  rawCommand: string | null,
  context: antlr.ParserRuleContext | null,
): string {
  if (rawCommand === null || !context) {
    return '';
  }

  const start = context.start?.start ?? -1;
  const stop = context.stop?.stop ?? -1;
  if (start < 0 || stop < start) {
    return '';
  }

  return rawCommand.slice(start, stop + 1);
}

export function getAlias(expression: NamedExpressionContext): string | null {
  return expression
    .namedExpressionNameClause()
    ?.identifierOrExtendedKeywordOrEscapedName()
    ?.getText() ?? null;
}

export function isDescending(expression: OrderedExpressionContext): boolean {
  const orderedExpressionText = expression.getText().toLowerCase();
  const hasExplicitDesc = orderedExpressionText.endsWith('desc');
  const hasExplicitAsc = orderedExpressionText.endsWith('asc');
  return hasExplicitDesc ? true : hasExplicitAsc ? false : true;
}

export type TabularSourceResolver = {
  resolveTableRows: (name: string) => KustoRow[];
  executePipeExpression: (pipeExpression: PipeExpressionContext, rawCommand: string | null) => KustoRow[];
};

export function resolveUnionSource(
  expression: UnionOperatorExpressionContext,
  options: QueryAstParserOptions,
  rawCommand: string | null,
  resolver: TabularSourceResolver,
): KustoRow[] {
  const visitor = new KqlVisitor<KustoRow[]>();

  visitor.visitEntityNameReference = (ctx: EntityNameReferenceContext) => {
    return resolver.resolveTableRows(options.normalizeName(ctx.getText()));
  };

  visitor.visitWildcardedEntityExpression = (ctx: WildcardedEntityExpressionContext) => {
    throw new Error(`Unsupported union source: ${ctx.getText()}`);
  };

  visitor.visitParenthesizedExpression = (ctx: ParenthesizedExpressionContext) => {
    const text = getTextFromTokenRange(rawCommand, expression).trim() || ctx.getText().trim();
    const inner = text.startsWith('(') && text.endsWith(')') ? text.slice(1, -1).trim() : text;

    if (!inner) {
      throw new Error(`Unsupported union source: ${ctx.getText()}`);
    }

    if (inner.includes('|')) {
      return resolver.executePipeExpression(parseTabularSubquery(inner), inner);
    }

    return resolver.resolveTableRows(options.normalizeName(inner));
  };

  const result = visitor.visit(expression);
  if (!result) {
    throw new Error(`Unsupported union source: ${expression.getText()}`);
  }

  return result;
}

export function resolveTabularSource(
  sourceExpression: UnnamedExpressionContext,
  options: QueryAstParserOptions,
  rawCommand: string | null,
  resolver: TabularSourceResolver,
): KustoRow[] {
  const sourceText = getTextFromTokenRange(rawCommand, sourceExpression).trim() || sourceExpression.getText().trim();
  const inner = sourceText.startsWith('(') && sourceText.endsWith(')') ? sourceText.slice(1, -1).trim() : sourceText;

  if (!inner) {
    throw new Error(`Unsupported tabular source: ${sourceExpression.getText()}`);
  }

  if (inner.includes('|') || inner.toLowerCase().startsWith('datatable')) {
    return resolver.executePipeExpression(parseTabularSubquery(inner), inner);
  }

  return resolver.resolveTableRows(options.normalizeName(inner));
}

function parseTabularSubquery(text: string): PipeExpressionContext {
  const lexer = new KqlLexer(antlr.CharStream.fromString(text));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  if (parser.numberOfSyntaxErrors > 0) {
    throw new Error(`Unsupported tabular source: ${text}`);
  }

  const statements = top.query().statement();
  if (statements.length !== 1) {
    throw new Error(`Unsupported tabular source: ${text}`);
  }

  const queryStatement = statements[0].queryStatement();
  if (!queryStatement) {
    throw new Error(`Unsupported tabular source: ${text}`);
  }

  const pipeExpression = queryStatement.expression().pipeExpression();
  if (pipeExpression.beforePipeExpression().managementCommandExpression()) {
    throw new Error(`Unsupported tabular source: ${text}`);
  }

  return pipeExpression;
}

export function getJoinKind(
  parameters: RelaxedQueryOperatorParameterContext[],
): 'inner' | 'leftouter' {
  const kind = getRelaxedParameterValue(parameters, 'kind');
  if (kind === 'leftouter') {
    return 'leftouter';
  }

  return 'inner';
}

export function getLookupKind(
  parameters: RelaxedQueryOperatorParameterContext[],
): 'inner' | 'leftouter' {
  const kind = getRelaxedParameterValue(parameters, 'kind');
  if (kind === 'inner') {
    return 'inner';
  }

  return 'leftouter';
}

function getRelaxedParameterValue(
  parameters: RelaxedQueryOperatorParameterContext[],
  parameterName: string,
): string | null {
  for (const parameter of parameters) {
    const isKindParameter = parameterName === 'kind' && parameter.KIND() !== null;
    if (!isKindParameter) {
      const text = parameter.getText().toLowerCase();
      if (!text.startsWith(`${parameterName}=`)) {
        continue;
      }
    }

    const nameValue = parameter.identifierOrKeywordName()?.getText();
    if (nameValue) {
      return normalizeParameterValue(nameValue);
    }

    const literalValue = parameter.literalExpression()?.getText();
    if (literalValue) {
      return normalizeParameterValue(literalValue);
    }
  }

  return null;
}

function normalizeParameterValue(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}
