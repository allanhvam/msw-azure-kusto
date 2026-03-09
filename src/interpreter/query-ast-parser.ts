import * as antlr from 'antlr4ng';
import { KqlLexer } from '../parser/KqlLexer.js';
import type {
  AfterPipeOperatorContext,
  NamedExpressionContext,
  OrderedExpressionContext,
  PipeExpressionContext,
  QueryStatementContext,
  RelaxedQueryOperatorParameterContext,
  UnionOperatorExpressionContext,
  UnnamedExpressionContext} from '../parser/KqlParser.js';
import {
  KqlParser,
} from '../parser/KqlParser.js';
import type { CommandAst, NamedExpressionAst, OrderedExpressionAst, QueryAst, QueryOperatorAst, QuerySourceAst, TabularSourceAst } from './types.js';

export type QueryAstParserOptions = {
  normalizeName: (name: string) => string;
};

export function parseStatementToCommandAst(statement: unknown, rawCommand: string, options: QueryAstParserOptions): CommandAst {
  const queryStatement = (statement as { queryStatement(): unknown | null }).queryStatement();
  if (!queryStatement) {
    throw new Error('Only query statements are supported.');
  }

  return parseQueryStatementToCommandAst(queryStatement, rawCommand, options);
}

export function parseQueryStatementToCommandAst(
  queryStatement: unknown,
  rawCommand: string,
  options: QueryAstParserOptions,
): CommandAst {
  const statementContext = queryStatement as QueryStatementContext | null;
  if (!statementContext || typeof statementContext.expression !== 'function') {
    throw new Error('Expected query statement context.');
  }

  const pipeExpression = statementContext.expression().pipeExpression();
  const before = pipeExpression.beforePipeExpression();
  const managementCommandExpression = before.managementCommandExpression();
  if (managementCommandExpression) {
    const commandNameContext = managementCommandExpression.managementCommandName();
    const commandName = commandNameContext.getText().toLowerCase();
    const body = managementCommandExpression.managementCommandBody();

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

    return {
      kind: 'management',
      command: rawCommand,
      commandName,
      argumentsText,
      fromQueryPayload,
      tableName,
      schemaText,
      argumentTokens,
    };
  }

  const sourceExpression = before.unnamedExpression();
  const rangeExpression = before.rangeExpression();
  const printOperator = before.printOperator();
  const rootUnionOperator = before.beforeOrAfterPipeOperator()?.unionOperator() ?? null;
  let source: QuerySourceAst;
  if (rangeExpression) {
    const [fromExpression, toExpression, stepExpression] = rangeExpression.unnamedExpression();
    source = {
      kind: 'range',
      columnName: rangeExpression.simpleNameReference().getText(),
      fromExpression: fromExpression as UnnamedExpressionContext,
      toExpression: toExpression as UnnamedExpressionContext,
      stepExpression: stepExpression as UnnamedExpressionContext,
    };
  } else if (rootUnionOperator) {
    source = {
      kind: 'union',
      sources: rootUnionOperator
        .unionOperatorExpression()
        .map((item) => getUnionSource(item, options, rawCommand)),
    };
  } else if (printOperator) {
    source = {
      kind: 'print',
      expressions: printOperator.namedExpression().map((item) => getNamedExpressionAst(item)),
    };
  } else {
    if (!sourceExpression) {
      throw new Error('Unsupported query source expression.');
    }

    const sourceText = sourceExpression.getText().trim();
    if (sourceText.toLowerCase().startsWith('datatable')) {
      source = {
        kind: 'datatable',
        expressionText: sourceText,
      };
    } else {
      source = {
        kind: 'table',
        name: getSourceName(sourceExpression, options),
      };
    }
  }

  const operators = pipeExpression.pipedOperator().map((piped) => parseAfterPipeOperatorToAst(
    piped.afterPipeOperator(),
    options,
    rawCommand,
  ));

  return {
    kind: 'query',
    query: {
      source,
      operators,
    },
  };
}

function getTextFromTokenRange(
  rawCommand: string | null,
  context: unknown,
): string {
  if (rawCommand === null) {
    return '';
  }

  if (!context || typeof context !== 'object') {
    return '';
  }

  const tokenRange = context as {
    start?: { start?: number };
    stop?: { stop?: number };
  };

  const start = tokenRange.start?.start ?? -1;
  const stop = tokenRange.stop?.stop ?? -1;
  if (start < 0 || stop < start) {
    return '';
  }

  return rawCommand.slice(start, stop + 1);
}

export function parsePipeExpressionToQueryAst(pipeExpression: unknown, options: QueryAstParserOptions): QueryAst {
  const expression = pipeExpression as PipeExpressionContext | null;
  if (!expression || typeof expression.beforePipeExpression !== 'function') {
    throw new Error('Expected pipe expression context.');
  }

  const before = expression.beforePipeExpression();
  if (before.managementCommandExpression() !== null) {
    throw new Error('Management commands are not supported in let tabular assignment.');
  }

  const sourceExpression = before.unnamedExpression();
  const rangeExpression = before.rangeExpression();
  const printOperator = before.printOperator();
  const rootUnionOperator = before.beforeOrAfterPipeOperator()?.unionOperator() ?? null;
  let source: QuerySourceAst;
  if (rangeExpression) {
    const [fromExpression, toExpression, stepExpression] = rangeExpression.unnamedExpression();
    source = {
      kind: 'range',
      columnName: rangeExpression.simpleNameReference().getText(),
      fromExpression: fromExpression as UnnamedExpressionContext,
      toExpression: toExpression as UnnamedExpressionContext,
      stepExpression: stepExpression as UnnamedExpressionContext,
    };
  } else if (rootUnionOperator) {
    source = {
      kind: 'union',
      sources: rootUnionOperator
        .unionOperatorExpression()
        .map((item) => getUnionSource(item, options, null)),
    };
  } else if (printOperator) {
    source = {
      kind: 'print',
      expressions: printOperator.namedExpression().map((item) => getNamedExpressionAst(item)),
    };
  } else {
    if (!sourceExpression) {
      throw new Error('Unsupported let tabular source expression.');
    }

    const sourceText = sourceExpression.getText().trim();
    if (sourceText.toLowerCase().startsWith('datatable')) {
      source = {
        kind: 'datatable',
        expressionText: sourceText,
      };
    } else {
      source = {
        kind: 'table',
        name: getSourceName(sourceExpression, options),
      };
    }
  }

  const operators = expression.pipedOperator().map((piped) => parseAfterPipeOperatorToAst(
    piped.afterPipeOperator(),
    options,
    null,
  ));

  return {
    source,
    operators,
  };
}

function parseAfterPipeOperatorToAst(
  typedOperator: AfterPipeOperatorContext,
  options: QueryAstParserOptions,
  rawCommand: string | null,
): QueryOperatorAst {

  const takeOperator = typedOperator.takeOperator();
  if (takeOperator) {
    return {
      kind: 'take',
      amountExpression: takeOperator.namedExpression().unnamedExpression() as UnnamedExpressionContext,
    };
  }

  const whereOperator = typedOperator.whereOperator();
  if (whereOperator) {
    return {
      kind: 'where',
      predicateExpression: whereOperator.namedExpression().unnamedExpression() as UnnamedExpressionContext,
    };
  }

  const extendOperator = typedOperator.extendOperator();
  if (extendOperator) {
    return { kind: 'extend', expressions: extendOperator.namedExpression().map((item) => getNamedExpressionAst(item)) };
  }

  const projectOperator = typedOperator.projectOperator();
  if (projectOperator) {
    return { kind: 'project', expressions: projectOperator.namedExpression().map((item) => getNamedExpressionAst(item)) };
  }

  const projectAwayOperator = typedOperator.projectAwayOperator();
  if (projectAwayOperator) {
    return { kind: 'project-away', columns: projectAwayOperator.simpleOrWildcardedNameReference().map((item) => item.getText()) };
  }

  const projectRenameOperator = typedOperator.projectRenameOperator();
  if (projectRenameOperator) {
    return {
      kind: 'project-rename',
      expressions: projectRenameOperator.namedExpression().map((item) => getNamedExpressionAst(item)),
    };
  }

  if (typedOperator.countOperator()) {
    return { kind: 'count' };
  }

  const distinctOperator = typedOperator.distinctOperator();
  if (distinctOperator) {
    return {
      kind: 'distinct',
      includeAllColumns: Boolean(distinctOperator.distinctOperatorStarTarget()),
      expressions:
        distinctOperator
          .distinctOperatorColumnListTarget()
          ?.namedExpression()
          .map((item) => getNamedExpressionAst(item)) ?? [],
    };
  }

  const sortOperator = typedOperator.sortOperator();
  if (sortOperator) {
    return { kind: 'sort', expressions: sortOperator.orderedExpression().map((item) => getOrderedExpressionAst(item)) };
  }

  const topOperator = typedOperator.topOperator();
  if (topOperator) {
    return {
      kind: 'top',
      amountExpression: topOperator.namedExpression().unnamedExpression() as UnnamedExpressionContext,
      by: getOrderedExpressionAst(topOperator.orderedExpression()),
    };
  }

  const mvexpandOperator = typedOperator.mvexpandOperator();
  if (mvexpandOperator) {
    const limitLiteral = mvexpandOperator.mvapplyOperatorLimitClause()?.LONGLITERAL().getText() ?? null;
    const limit = limitLiteral ? Number(limitLiteral) : null;
    if (limit !== null && (!Number.isFinite(limit) || !Number.isInteger(limit) || limit < 0)) {
      throw new Error(`Invalid mv-expand limit: ${limitLiteral}`);
    }

    return {
      kind: 'mvexpand',
      expressions: mvexpandOperator
        .mvexpandOperatorExpression()
        .map((expression) => getNamedExpressionAst(expression.namedExpression())),
      limit,
    };
  }

  const makeSeriesOperator = typedOperator.makeSeriesOperator();
  if (makeSeriesOperator) {
    const onExpression = makeSeriesOperator.makeSeriesOperatorOnClause()?._Expression;
    if (!onExpression) {
      throw new Error('Unsupported make-series syntax: missing on clause.');
    }

    const inRangeClause = makeSeriesOperator.makeSeriesOperatorInRangeClause();
    const fromToStepClause = makeSeriesOperator.makeSeriesOperatorFromToStepClause();
    const fromExpression = inRangeClause?._FromExpression?.unnamedExpression()
      ?? fromToStepClause?._FromExpression?.unnamedExpression();
    const toExpression = inRangeClause?._ToExpression?.unnamedExpression()
      ?? fromToStepClause?._ToExpression?.unnamedExpression();
    const stepExpression = inRangeClause?._StepExpression?.unnamedExpression()
      ?? fromToStepClause?._StepExpression?.unnamedExpression();

    if (!fromExpression || !toExpression || !stepExpression) {
      throw new Error('Unsupported make-series syntax: missing from/to/step clause.');
    }

    const aggregationHeaders = makeSeriesOperator.relaxedQueryOperatorParameter().map((parameter) => {
      const headerText = parameter.getText().trim();
      const assignment = headerText.match(/^([_A-Za-z]\w*)=([_A-Za-z]\w*)$/);
      if (assignment) {
        return {
          alias: assignment[1],
          functionName: assignment[2].toLowerCase(),
        };
      }

      return {
        alias: null,
        functionName: headerText.toLowerCase(),
      };
    });

    return {
      kind: 'make-series',
      aggregations: makeSeriesOperator
        .makeSeriesOperatorAggregation()
        .map((aggregation, index) => {
          const header = aggregationHeaders[index];
          const functionNameRaw = header?.functionName ?? 'avg';
          if (functionNameRaw !== 'count' && functionNameRaw !== 'sum' && functionNameRaw !== 'avg' && functionNameRaw !== 'min' && functionNameRaw !== 'max') {
            throw new Error(`Unsupported make-series aggregation function: ${functionNameRaw}`);
          }

          return {
            functionName: functionNameRaw,
            valueExpression: aggregation._Expression ? getNamedExpressionAst(aggregation._Expression) : null,
            alias: header?.alias ?? null,
            defaultExpression: aggregation._Default?._Value
              ? getNamedExpressionAst(aggregation._Default._Value)
              : null,
          };
        }),
      on: getNamedExpressionAst(onExpression),
      fromExpression: fromExpression as UnnamedExpressionContext,
      toExpression: toExpression as UnnamedExpressionContext,
      stepExpression: stepExpression as UnnamedExpressionContext,
      by: makeSeriesOperator.makeSeriesOperatorByClause()?._Expressions.map((item) => getNamedExpressionAst(item)) ?? [],
    };
  }

  const summarizeOperator = typedOperator.summarizeOperator();
  if (summarizeOperator) {
    return {
      kind: 'summarize',
      aggregations: summarizeOperator.namedExpression().map((item) => getNamedExpressionAst(item)),
      by: summarizeOperator
        .summarizeOperatorByClause()
        ?.namedExpression()
        .map((item) => getNamedExpressionAst(item)) ?? [],
    };
  }

  const unionOperator = typedOperator.unionOperator();
  if (unionOperator) {
    return {
      kind: 'union',
      sources: unionOperator
        .unionOperatorExpression()
        .map((item) => getUnionSource(item, options, rawCommand)),
    };
  }

  const partitionOperator = typedOperator.partitionOperator();
  if (partitionOperator) {
    const subExpressionBody = partitionOperator.partitionOperatorSubExpressionBody();
    if (!subExpressionBody) {
      throw new Error('Only partition subexpression body is supported.');
    }

    const subExpression = subExpressionBody.pipeSubExpression();
    return {
      kind: 'partition',
      byExpression: partitionOperator.entityExpression(),
      subExpressionOperators: [
        parseAfterPipeOperatorToAst(subExpression.afterPipeOperator(), options, rawCommand),
        ...subExpression.pipedOperator().map((piped) => parseAfterPipeOperatorToAst(
          piped.afterPipeOperator(),
          options,
          rawCommand,
        )),
      ],
    };
  }

  const joinOperator = typedOperator.joinOperator();
  if (joinOperator) {
    return {
      kind: 'join',
      joinKind: getJoinKind(joinOperator.relaxedQueryOperatorParameter()),
      rightSource: getTabularSource(joinOperator.unnamedExpression(), options, rawCommand),
      on: joinOperator.joinOperatorOnClause()?.unnamedExpression().map((item) => item.getText()) ?? [],
    };
  }

  const lookupOperator = typedOperator.lookupOperator();
  if (lookupOperator) {
    return {
      kind: 'lookup',
      lookupKind: getLookupKind(lookupOperator.relaxedQueryOperatorParameter()),
      rightSource: getTabularSource(lookupOperator.unnamedExpression(), options, rawCommand),
      on: lookupOperator.joinOperatorOnClause().unnamedExpression().map((item) => item.getText()),
    };
  }

  throw new Error(`Unsupported operator: ${typedOperator.getText()}`);
}

function getSourceName(sourceExpression: UnnamedExpressionContext, options: QueryAstParserOptions): string {
  const text = options.normalizeName(sourceExpression.getText());
  if (!text) {
    throw new Error('Missing source table.');
  }

  return text;
}

function getNamedExpressionAst(expression: NamedExpressionContext): NamedExpressionAst {
  const alias = expression
    .namedExpressionNameClause()
    ?.identifierOrExtendedKeywordOrEscapedName()
    ?.getText();

  return {
    alias: alias ?? null,
    expression: expression.unnamedExpression(),
  };
}

function getOrderedExpressionAst(expression: OrderedExpressionContext): OrderedExpressionAst {
  const orderedExpressionText = expression.getText().toLowerCase();
  const hasExplicitDesc = orderedExpressionText.endsWith('desc');
  const hasExplicitAsc = orderedExpressionText.endsWith('asc');

  return {
    expression: getNamedExpressionAst(expression.namedExpression()),
    descending: hasExplicitDesc ? true : hasExplicitAsc ? false : true,
  };
}

function getUnionSource(
  expression: UnionOperatorExpressionContext,
  options: QueryAstParserOptions,
  rawCommand: string | null,
): TabularSourceAst {
  const entity = expression.entityNameReference();
  if (entity) {
    return {
      kind: 'table',
      name: options.normalizeName(entity.getText()),
    };
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
      return {
        kind: 'subquery',
        query: parseTabularSubquery(inner, options),
      };
    }

    return {
      kind: 'table',
      name: options.normalizeName(inner),
    };
  }

  throw new Error(`Unsupported union source: ${expression.getText()}`);
}

function getTabularSource(
  sourceExpression: UnnamedExpressionContext,
  options: QueryAstParserOptions,
  rawCommand: string | null,
): TabularSourceAst {
  const sourceText = getTextFromTokenRange(rawCommand, sourceExpression).trim() || sourceExpression.getText().trim();
  const inner = sourceText.startsWith('(') && sourceText.endsWith(')') ? sourceText.slice(1, -1).trim() : sourceText;

  if (!inner) {
    throw new Error(`Unsupported tabular source: ${sourceExpression.getText()}`);
  }

  if (inner.includes('|')) {
    return {
      kind: 'subquery',
      query: parseTabularSubquery(inner, options),
    };
  }

  if (inner.toLowerCase().startsWith('datatable')) {
    return {
      kind: 'subquery',
      query: parseTabularSubquery(inner, options),
    };
  }

  return {
    kind: 'table',
    name: options.normalizeName(inner),
  };
}

function parseTabularSubquery(text: string, options: QueryAstParserOptions): QueryAst {
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

  const ast = parseQueryStatementToCommandAst(queryStatement, text, options);
  if (ast.kind !== 'query') {
    throw new Error(`Unsupported tabular source: ${text}`);
  }

  return ast.query;
}

function getJoinKind(
  parameters: RelaxedQueryOperatorParameterContext[],
): 'inner' | 'leftouter' {
  const kind = getRelaxedParameterValue(parameters, 'kind');
  if (kind === 'leftouter') {
    return 'leftouter';
  }

  return 'inner';
}

function getLookupKind(
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
