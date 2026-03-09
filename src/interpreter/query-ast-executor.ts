import type { EntityExpressionContext, UnnamedExpressionContext } from '../parser/KqlParser.js';
import type {
  KustoRow,
  NamedExpressionAst,
  OrderedExpressionAst,
  QueryAst,
  QueryOperatorAst,
  TabularSourceAst,
} from './types.js';

export type QueryAstExecutionHandlers = {
  resolveTableSource: (name: string) => KustoRow[];
  resolveDataTableSource: (expressionText: string) => KustoRow[];
  resolveUnionSource: (sources: TabularSourceAst[]) => KustoRow[];
  resolvePrintSource: (expressions: NamedExpressionAst[]) => KustoRow[];
  resolveRangeSource: (
    columnName: string,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
  ) => KustoRow[];
  applyTake: (rows: KustoRow[], amountExpression: UnnamedExpressionContext) => KustoRow[];
  applyWhere: (rows: KustoRow[], predicateExpression: UnnamedExpressionContext) => KustoRow[];
  applyExtend: (rows: KustoRow[], expressions: NamedExpressionAst[]) => KustoRow[];
  applyProject: (rows: KustoRow[], expressions: NamedExpressionAst[]) => KustoRow[];
  applyProjectAway: (rows: KustoRow[], columns: string[]) => KustoRow[];
  applyProjectRename: (rows: KustoRow[], expressions: NamedExpressionAst[]) => KustoRow[];
  applyCount: (rows: KustoRow[]) => KustoRow[];
  applyDistinct: (rows: KustoRow[], includeAllColumns: boolean, expressions: NamedExpressionAst[]) => KustoRow[];
  applySort: (rows: KustoRow[], expressions: OrderedExpressionAst[]) => KustoRow[];
  applyTop: (rows: KustoRow[], amountExpression: UnnamedExpressionContext, by: OrderedExpressionAst) => KustoRow[];
  applyMvExpand: (rows: KustoRow[], expressions: NamedExpressionAst[], limit: number | null) => KustoRow[];
  applyMakeSeries: (
    rows: KustoRow[],
    aggregations: Array<{
      functionName: 'count' | 'sum' | 'avg' | 'min' | 'max';
      valueExpression: NamedExpressionAst | null;
      alias: string | null;
      defaultExpression: NamedExpressionAst | null;
    }>,
    on: NamedExpressionAst,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
    by: NamedExpressionAst[],
  ) => KustoRow[];
  applySummarize: (rows: KustoRow[], aggregations: NamedExpressionAst[], by: NamedExpressionAst[]) => KustoRow[];
  applyUnion: (rows: KustoRow[], sources: TabularSourceAst[]) => KustoRow[];
  applyPartition: (
    rows: KustoRow[],
    byExpression: EntityExpressionContext,
    subExpressionOperators: QueryOperatorAst[],
  ) => KustoRow[];
  applyJoin: (
    rows: KustoRow[],
    joinKind: 'inner' | 'leftouter',
    rightSource: TabularSourceAst,
    on: string[],
  ) => KustoRow[];
  applyLookup: (
    rows: KustoRow[],
    lookupKind: 'inner' | 'leftouter',
    rightSource: TabularSourceAst,
    on: string[],
  ) => KustoRow[];
};

export function executeQueryAst(query: QueryAst, handlers: QueryAstExecutionHandlers): KustoRow[] {
  let current: KustoRow[];
  if (query.source.kind === 'table') {
    current = handlers.resolveTableSource(query.source.name);
  } else if (query.source.kind === 'datatable') {
    current = handlers.resolveDataTableSource(query.source.expressionText);
  } else if (query.source.kind === 'union') {
    current = handlers.resolveUnionSource(query.source.sources);
  } else if (query.source.kind === 'print') {
    current = handlers.resolvePrintSource(query.source.expressions);
  } else {
    current = handlers.resolveRangeSource(
      query.source.columnName,
      query.source.fromExpression,
      query.source.toExpression,
      query.source.stepExpression,
    );
  }

  for (const operator of query.operators) {
    current = applyOperator(current, operator, handlers);
  }

  return current;
}

function applyOperator(rows: KustoRow[], operator: QueryOperatorAst, handlers: QueryAstExecutionHandlers): KustoRow[] {
  if (operator.kind === 'take') {
    return handlers.applyTake(rows, operator.amountExpression);
  }

  if (operator.kind === 'where') {
    return handlers.applyWhere(rows, operator.predicateExpression);
  }

  if (operator.kind === 'extend') {
    return handlers.applyExtend(rows, operator.expressions);
  }

  if (operator.kind === 'project') {
    return handlers.applyProject(rows, operator.expressions);
  }

  if (operator.kind === 'project-away') {
    return handlers.applyProjectAway(rows, operator.columns);
  }

  if (operator.kind === 'project-rename') {
    return handlers.applyProjectRename(rows, operator.expressions);
  }

  if (operator.kind === 'count') {
    return handlers.applyCount(rows);
  }

  if (operator.kind === 'distinct') {
    return handlers.applyDistinct(rows, operator.includeAllColumns, operator.expressions);
  }

  if (operator.kind === 'sort') {
    return handlers.applySort(rows, operator.expressions);
  }

  if (operator.kind === 'top') {
    return handlers.applyTop(rows, operator.amountExpression, operator.by);
  }

  if (operator.kind === 'mvexpand') {
    return handlers.applyMvExpand(rows, operator.expressions, operator.limit);
  }

  if (operator.kind === 'make-series') {
    return handlers.applyMakeSeries(
      rows,
      operator.aggregations,
      operator.on,
      operator.fromExpression,
      operator.toExpression,
      operator.stepExpression,
      operator.by,
    );
  }

  if (operator.kind === 'summarize') {
    return handlers.applySummarize(rows, operator.aggregations, operator.by);
  }

  if (operator.kind === 'union') {
    return handlers.applyUnion(rows, operator.sources);
  }

  if (operator.kind === 'partition') {
    return handlers.applyPartition(rows, operator.byExpression, operator.subExpressionOperators);
  }

  if (operator.kind === 'join') {
    return handlers.applyJoin(rows, operator.joinKind, operator.rightSource, operator.on);
  }

  return handlers.applyLookup(rows, operator.lookupKind, operator.rightSource, operator.on);
}
