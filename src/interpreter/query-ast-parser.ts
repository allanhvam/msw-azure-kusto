import * as antlr from 'antlr4ng';
import { KqlLexer } from '../parser/KqlLexer.js';
import type {
  ManagementCommandExpressionContext,
  NamedExpressionContext,
  OrderedExpressionContext,
  PipeExpressionContext,
  QueryStatementContext,
  RelaxedQueryOperatorParameterContext,
  StatementContext,
  UnionOperatorExpressionContext,
  UnnamedExpressionContext} from '../parser/KqlParser.js';
import {
  KqlParser,
} from '../parser/KqlParser.js';
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

export function extractManagementCommandFields(ctx: ManagementCommandExpressionContext, rawCommand: string) {
  const commandName = ctx.managementCommandName().getText().toLowerCase();
  const body = ctx.managementCommandBody();

  let tableName: string | null = null;
  let schemaText: string | null = null;
  let argumentTokens: string[] = [];
  let argumentsText = '';
  let fromQueryPayload: string | null = null;

  const tableWithSchemaBody = body?.managementTableWithSchemaBody() ?? null;
  if (tableWithSchemaBody) {
    tableName = tableWithSchemaBody.managementCommandIdentifier().getText();
    schemaText = tableWithSchemaBody.managementSchemaText().getText();
    argumentsText = getTextFromTokenRange(rawCommand, tableWithSchemaBody);
  }

  const dropTableBody = body?.managementDropTableBody() ?? null;
  if (dropTableBody) {
    const identifiers = dropTableBody.managementCommandIdentifier();
    tableName = identifiers[0]?.getText() ?? null;
    argumentTokens = identifiers.slice(1).map((identifier) => identifier.getText().toLowerCase());
    argumentsText = getTextFromTokenRange(rawCommand, dropTableBody);
  }

  const tableTargetBody = body?.managementTableTargetBody() ?? null;
  if (tableTargetBody) {
    tableName = tableTargetBody.managementCommandIdentifier().getText();
    argumentTokens = tableTargetBody.managementCommandToken().map((token) => token.getText().toLowerCase());
    argumentsText = getTextFromTokenRange(rawCommand, tableTargetBody);
  }

  const showBody = body?.managementShowBody() ?? null;
  if (showBody) {
    argumentTokens = [showBody.managementCommandIdentifier().getText().toLowerCase()];
    argumentsText = getTextFromTokenRange(rawCommand, showBody);
  }

  const ingestInlineBody = body?.managementIngestInlineBody() ?? null;
  if (ingestInlineBody) {
    tableName = ingestInlineBody._TableName?.getText() ?? null;
    const inlineKeyword = ingestInlineBody._InlineKeyword?.getText().toLowerCase() ?? 'inline';
    argumentTokens = [inlineKeyword];
    fromQueryPayload = getTextFromTokenRange(rawCommand, ingestInlineBody.managementFromQueryPayload());
    argumentsText = getTextFromTokenRange(rawCommand, ingestInlineBody);
  }

  const ingestFromUriBody = body?.managementIngestFromUriBody() ?? null;
  if (ingestFromUriBody) {
    tableName = ingestFromUriBody._TableName?.getText() ?? null;
    argumentTokens = ['uri'];
    fromQueryPayload = getTextFromTokenRange(rawCommand, ingestFromUriBody.managementIngestSourceText());
    argumentsText = getTextFromTokenRange(rawCommand, ingestFromUriBody);
  }

  const genericBody = body?.managementGenericBody() ?? null;
  if (genericBody) {
    argumentTokens = genericBody.managementCommandToken().map((token) => token.getText().toLowerCase());
    argumentsText = getTextFromTokenRange(rawCommand, genericBody);
  }

  return { command: rawCommand, commandName, argumentsText, fromQueryPayload, tableName, schemaText, argumentTokens };
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
  const entity = expression.entityNameReference();
  if (entity) {
    return resolver.resolveTableRows(options.normalizeName(entity.getText()));
  }

  const wildcarded = expression.wildcardedEntityExpression();
  if (wildcarded) {
    throw new Error(`Unsupported union source: ${wildcarded.getText()}`);
  }

  const parenthesized = expression.parenthesizedExpression();
  if (parenthesized) {
    const text = getTextFromTokenRange(rawCommand, expression).trim() || parenthesized.getText().trim();
    const inner = text.startsWith('(') && text.endsWith(')') ? text.slice(1, -1).trim() : text;

    if (!inner) {
      throw new Error(`Unsupported union source: ${parenthesized.getText()}`);
    }

    if (inner.includes('|')) {
      return resolver.executePipeExpression(parseTabularSubquery(inner), inner);
    }

    return resolver.resolveTableRows(options.normalizeName(inner));
  }

  throw new Error(`Unsupported union source: ${expression.getText()}`);
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
