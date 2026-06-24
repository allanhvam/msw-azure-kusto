import type {
  AfterPipeOperatorContext,
  DistinctOperatorContext,
  EntityExpressionContext,
  ExtendOperatorContext,
  JoinOperatorContext,
  LookupOperatorContext,
  MakeSeriesOperatorContext,
  MvapplyOperatorContext,
  MvexpandOperatorContext,
  NamedExpressionContext,
  OrderedExpressionContext,
  PartitionOperatorContext,
  PipeExpressionContext,
  PrintOperatorContext,
  ProjectAwayOperatorContext,
  ProjectOperatorContext,
  ProjectRenameOperatorContext,
  RangeExpressionContext,
  ScalarParameterContext,
  ScanOperatorContext,
  SortOperatorContext,
  SummarizeOperatorContext,
  TakeOperatorContext,
  TopOperatorContext,
  UnionOperatorContext,
  UnnamedExpressionContext,
  WhereOperatorContext,
} from '../parser/KqlParser.js';
import { KqlVisitor } from '../parser/KqlVisitor.js';
import type { QueryAstParserOptions, TabularSourceResolver } from './query-ast-parser.js';
import { getJoinKind, getLookupKind, resolveTabularSource, resolveUnionSource } from './query-ast-parser.js';
import type {
  KustoRow,
} from './types.js';

export type ScanStepSpec = {
  name: string;
  output: 'all' | 'last' | 'none';
  condition: UnnamedExpressionContext;
  assignments: Array<{ name: string; expression: UnnamedExpressionContext }>;
};

export type ScanSpec = {
  matchIdColumn: string | null;
  partitionBy: UnnamedExpressionContext[];
  orderBy: OrderedExpressionContext[];
  declarations: ScalarParameterContext[];
  steps: ScanStepSpec[];
};

export type QueryAstExecutionHandlers = {
  parserOptions: QueryAstParserOptions;
  resolveTableSource: (name: string) => KustoRow[];
  resolveDataTableSource: (expressionText: string) => KustoRow[];
  resolvePrintSource: (expressions: NamedExpressionContext[]) => KustoRow[];
  resolveRangeSource: (
    columnName: string,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
  ) => KustoRow[];
  applyTake: (rows: KustoRow[], amountExpression: UnnamedExpressionContext) => KustoRow[];
  applyWhere: (rows: KustoRow[], predicateExpression: UnnamedExpressionContext) => KustoRow[];
  applyExtend: (rows: KustoRow[], expressions: NamedExpressionContext[]) => KustoRow[];
  applyProject: (rows: KustoRow[], expressions: NamedExpressionContext[]) => KustoRow[];
  applyProjectAway: (rows: KustoRow[], columns: string[]) => KustoRow[];
  applyProjectRename: (rows: KustoRow[], expressions: NamedExpressionContext[]) => KustoRow[];
  applyCount: (rows: KustoRow[]) => KustoRow[];
  applyDistinct: (rows: KustoRow[], includeAllColumns: boolean, expressions: NamedExpressionContext[]) => KustoRow[];
  applySort: (rows: KustoRow[], expressions: OrderedExpressionContext[]) => KustoRow[];
  applyTop: (rows: KustoRow[], amountExpression: UnnamedExpressionContext, by: OrderedExpressionContext) => KustoRow[];
  applyMvExpand: (rows: KustoRow[], expressions: NamedExpressionContext[], limit: number | null) => KustoRow[];
  applyMvApply: (
    rows: KustoRow[],
    expressions: NamedExpressionContext[],
    limit: number | null,
    subExpressionOperators: AfterPipeOperatorContext[],
  ) => KustoRow[];
  applyMakeSeries: (
    rows: KustoRow[],
    aggregations: Array<{
      functionName: 'count' | 'sum' | 'avg' | 'min' | 'max';
      valueExpression: NamedExpressionContext | null;
      alias: string | null;
      defaultExpression: NamedExpressionContext | null;
    }>,
    on: NamedExpressionContext,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
    by: NamedExpressionContext[],
  ) => KustoRow[];
  applySummarize: (rows: KustoRow[], aggregations: NamedExpressionContext[], by: NamedExpressionContext[]) => KustoRow[];
  applyUnion: (rows: KustoRow[], unionRows: KustoRow[]) => KustoRow[];
  applyPartition: (
    rows: KustoRow[],
    byExpression: EntityExpressionContext,
    subExpressionOperators: AfterPipeOperatorContext[],
  ) => KustoRow[];
  applyJoin: (
    rows: KustoRow[],
    joinKind: 'inner' | 'leftouter',
    rightRows: KustoRow[],
    on: string[],
  ) => KustoRow[];
  applyLookup: (
    rows: KustoRow[],
    lookupKind: 'inner' | 'leftouter',
    rightRows: KustoRow[],
    on: string[],
  ) => KustoRow[];
  applyScan: (rows: KustoRow[], spec: ScanSpec) => KustoRow[];
};

export function executePipeExpression(
  pipeExpression: PipeExpressionContext,
  rawCommand: string | null,
  handlers: QueryAstExecutionHandlers,
): KustoRow[] {
  const before = pipeExpression.beforePipeExpression();

  const sourceVisitor = new KqlVisitor<KustoRow[]>();

  sourceVisitor.visitRangeExpression = (ctx: RangeExpressionContext) => {
    const [fromExpression, toExpression, stepExpression] = ctx.unnamedExpression();
    return handlers.resolveRangeSource(
      ctx.simpleNameReference().getText(),
      fromExpression as UnnamedExpressionContext,
      toExpression as UnnamedExpressionContext,
      stepExpression as UnnamedExpressionContext,
    );
  };

  sourceVisitor.visitPrintOperator = (ctx: PrintOperatorContext) => {
    return handlers.resolvePrintSource(ctx.namedExpression());
  };

  sourceVisitor.visitUnionOperator = (ctx: UnionOperatorContext) => {
    const resolver = createTabularSourceResolver(handlers);
    const unionRows: KustoRow[] = [];
    for (const item of ctx.unionOperatorExpression()) {
      unionRows.push(...resolveUnionSource(item, handlers.parserOptions, rawCommand, resolver));
    }
    return unionRows;
  };

  sourceVisitor.visitUnnamedExpression = (ctx: UnnamedExpressionContext) => {
    const sourceText = ctx.getText().trim();
    if (sourceText.toLowerCase().startsWith('datatable')) {
      return handlers.resolveDataTableSource(sourceText);
    }
    return handlers.resolveTableSource(sourceText);
  };

  const sourceRows = sourceVisitor.visit(before);
  if (!sourceRows) {
    throw new Error('Unsupported query source expression.');
  }

  let current = sourceRows;
  for (const piped of pipeExpression.pipedOperator()) {
    current = applyOperatorContext(current, piped.afterPipeOperator(), handlers, rawCommand);
  }

  return current;
}

export function applyOperators(
  rows: KustoRow[],
  operators: AfterPipeOperatorContext[],
  handlers: QueryAstExecutionHandlers,
  rawCommand: string | null,
): KustoRow[] {
  let current = rows;
  for (const operator of operators) {
    current = applyOperatorContext(current, operator, handlers, rawCommand);
  }
  return current;
}

function createTabularSourceResolver(
  handlers: QueryAstExecutionHandlers,
): TabularSourceResolver {
  return {
    resolveTableRows: (name) => handlers.resolveTableSource(name),
    executePipeExpression: (pipeExpression, subRawCommand) =>
      executePipeExpression(pipeExpression, subRawCommand, handlers),
  };
}

export function applyOperatorContext(
  rows: KustoRow[],
  operator: AfterPipeOperatorContext,
  handlers: QueryAstExecutionHandlers,
  rawCommand: string | null,
): KustoRow[] {
  const visitor = new PipeOperatorExecutor(rows, handlers, rawCommand);
  const result = visitor.visit(operator);
  if (!result) {
    throw new Error(`Unsupported operator: ${operator.getText()}`);
  }
  return result;
}

class PipeOperatorExecutor extends KqlVisitor<KustoRow[]> {
  private readonly rows: KustoRow[];
  private readonly handlers: QueryAstExecutionHandlers;
  private readonly rawCommand: string | null;

  constructor(
    rows: KustoRow[],
    handlers: QueryAstExecutionHandlers,
    rawCommand: string | null,
  ) {
    super();
    this.rows = rows;
    this.handlers = handlers;
    this.rawCommand = rawCommand;
  }

  visitTakeOperator = (ctx: TakeOperatorContext): KustoRow[] =>
    this.handlers.applyTake(this.rows, ctx.namedExpression().unnamedExpression() as UnnamedExpressionContext);

  visitWhereOperator = (ctx: WhereOperatorContext): KustoRow[] =>
    this.handlers.applyWhere(this.rows, ctx.namedExpression().unnamedExpression() as UnnamedExpressionContext);

  visitExtendOperator = (ctx: ExtendOperatorContext): KustoRow[] =>
    this.handlers.applyExtend(this.rows, ctx.namedExpression());

  visitProjectOperator = (ctx: ProjectOperatorContext): KustoRow[] =>
    this.handlers.applyProject(this.rows, ctx.namedExpression());

  visitProjectAwayOperator = (ctx: ProjectAwayOperatorContext): KustoRow[] =>
    this.handlers.applyProjectAway(this.rows, ctx.simpleOrWildcardedNameReference().map((item) => item.getText()));

  visitProjectRenameOperator = (ctx: ProjectRenameOperatorContext): KustoRow[] =>
    this.handlers.applyProjectRename(this.rows, ctx.namedExpression());

  visitCountOperator = (): KustoRow[] =>
    this.handlers.applyCount(this.rows);

  visitDistinctOperator = (ctx: DistinctOperatorContext): KustoRow[] =>
    this.handlers.applyDistinct(
      this.rows,
      Boolean(ctx.distinctOperatorStarTarget()),
      ctx.distinctOperatorColumnListTarget()?.namedExpression() ?? [],
    );

  visitSortOperator = (ctx: SortOperatorContext): KustoRow[] =>
    this.handlers.applySort(this.rows, ctx.orderedExpression());

  visitTopOperator = (ctx: TopOperatorContext): KustoRow[] =>
    this.handlers.applyTop(
      this.rows,
      ctx.namedExpression().unnamedExpression() as UnnamedExpressionContext,
      ctx.orderedExpression(),
    );

  visitMvexpandOperator = (ctx: MvexpandOperatorContext): KustoRow[] => {
    const limitLiteral = ctx.mvapplyOperatorLimitClause()?.LONGLITERAL().getText() ?? null;
    const limit = limitLiteral ? Number(limitLiteral) : null;
    if (limit !== null && (!Number.isFinite(limit) || !Number.isInteger(limit) || limit < 0)) {
      throw new Error(`Invalid mv-expand limit: ${limitLiteral}`);
    }

    return this.handlers.applyMvExpand(
      this.rows,
      ctx.mvexpandOperatorExpression().map((expression) => expression.namedExpression()),
      limit,
    );
  };

  visitMvapplyOperator = (ctx: MvapplyOperatorContext): KustoRow[] => {
    const limitLiteral = ctx.mvapplyOperatorLimitClause()?.LONGLITERAL().getText() ?? null;
    const limit = limitLiteral ? Number(limitLiteral) : null;
    if (limit !== null && (!Number.isFinite(limit) || !Number.isInteger(limit) || limit < 0)) {
      throw new Error(`Invalid mv-apply limit: ${limitLiteral}`);
    }

    const subExpression = ctx.contextualSubExpression().pipeSubExpression();
    if (!subExpression) {
      throw new Error('Only mv-apply on (subquery) form is supported.');
    }

    return this.handlers.applyMvApply(
      this.rows,
      ctx.mvapplyOperatorExpression().map((expression) => expression.namedExpression()),
      limit,
      [
        subExpression.afterPipeOperator(),
        ...subExpression.pipedOperator().map((piped) => piped.afterPipeOperator()),
      ],
    );
  };

  visitMakeSeriesOperator = (ctx: MakeSeriesOperatorContext): KustoRow[] => {
    const onExpression = ctx.makeSeriesOperatorOnClause()?._Expression;
    if (!onExpression) {
      throw new Error('Unsupported make-series syntax: missing on clause.');
    }

    const inRangeClause = ctx.makeSeriesOperatorInRangeClause();
    const fromToStepClause = ctx.makeSeriesOperatorFromToStepClause();
    const fromExpression = inRangeClause?._FromExpression?.unnamedExpression()
      ?? fromToStepClause?._FromExpression?.unnamedExpression();
    const toExpression = inRangeClause?._ToExpression?.unnamedExpression()
      ?? fromToStepClause?._ToExpression?.unnamedExpression();
    const stepExpression = inRangeClause?._StepExpression?.unnamedExpression()
      ?? fromToStepClause?._StepExpression?.unnamedExpression();

    if (!fromExpression || !toExpression || !stepExpression) {
      throw new Error('Unsupported make-series syntax: missing from/to/step clause.');
    }

    const aggregationHeaders = ctx.relaxedQueryOperatorParameter().map((parameter) => {
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

    return this.handlers.applyMakeSeries(
      this.rows,
      ctx.makeSeriesOperatorAggregation().map((aggregation, index) => {
        const header = aggregationHeaders[index];
        const functionNameRaw = header?.functionName ?? 'avg';
        if (functionNameRaw !== 'count' && functionNameRaw !== 'sum' && functionNameRaw !== 'avg' && functionNameRaw !== 'min' && functionNameRaw !== 'max') {
          throw new Error(`Unsupported make-series aggregation function: ${functionNameRaw}`);
        }

        return {
          functionName: functionNameRaw as 'count' | 'sum' | 'avg' | 'min' | 'max',
          valueExpression: aggregation._Expression ?? null,
          alias: header?.alias ?? null,
          defaultExpression: aggregation._Default?._Value ?? null,
        };
      }),
      onExpression,
      fromExpression as UnnamedExpressionContext,
      toExpression as UnnamedExpressionContext,
      stepExpression as UnnamedExpressionContext,
      ctx.makeSeriesOperatorByClause()?._Expressions ?? [],
    );
  };

  visitSummarizeOperator = (ctx: SummarizeOperatorContext): KustoRow[] =>
    this.handlers.applySummarize(
      this.rows,
      ctx.namedExpression(),
      ctx.summarizeOperatorByClause()?.namedExpression() ?? [],
    );

  visitUnionOperator = (ctx: UnionOperatorContext): KustoRow[] => {
    const resolver = createTabularSourceResolver(this.handlers);
    const unionRows: KustoRow[] = [];
    for (const item of ctx.unionOperatorExpression()) {
      unionRows.push(...resolveUnionSource(item, this.handlers.parserOptions, this.rawCommand, resolver));
    }
    return this.handlers.applyUnion(this.rows, unionRows);
  };

  visitPartitionOperator = (ctx: PartitionOperatorContext): KustoRow[] => {
    const subExpressionBody = ctx.partitionOperatorSubExpressionBody();
    if (!subExpressionBody) {
      throw new Error('Only partition subexpression body is supported.');
    }

    const subExpression = subExpressionBody.pipeSubExpression();
    return this.handlers.applyPartition(
      this.rows,
      ctx.entityExpression(),
      [
        subExpression.afterPipeOperator(),
        ...subExpression.pipedOperator().map((piped) => piped.afterPipeOperator()),
      ],
    );
  };

  visitJoinOperator = (ctx: JoinOperatorContext): KustoRow[] => {
    const resolver = createTabularSourceResolver(this.handlers);
    const rightRows = resolveTabularSource(ctx.unnamedExpression(), this.handlers.parserOptions, this.rawCommand, resolver);
    return this.handlers.applyJoin(
      this.rows,
      getJoinKind(ctx.relaxedQueryOperatorParameter()),
      rightRows,
      ctx.joinOperatorOnClause()?.unnamedExpression().map((item) => item.getText()) ?? [],
    );
  };

  visitScanOperator = (ctx: ScanOperatorContext): KustoRow[] => {
    let matchIdColumn: string | null = null;
    for (const parameter of ctx.relaxedQueryOperatorParameter()) {
      const text = parameter.getText();
      const equalsIndex = text.indexOf('=');
      if (equalsIndex > 0 && text.slice(0, equalsIndex).toLowerCase() === 'with_match_id') {
        matchIdColumn = text.slice(equalsIndex + 1);
      }
    }

    const steps: ScanStepSpec[] = ctx.scanOperatorStep().map((step) => {
      const outputClause = step.scanOperatorStepOutputClause();
      let output: 'all' | 'last' | 'none' = 'all';
      if (outputClause?.LAST()) {
        output = 'last';
      } else if (outputClause?.NONE()) {
        output = 'none';
      }

      const body = step.scanOperatorBody();
      const assignments = (body?.scanOperatorAssignment() ?? []).map((assignment) => ({
        name: assignment.parameterName().getText(),
        expression: assignment.unnamedExpression(),
      }));

      return {
        name: step.parameterName().getText(),
        output,
        condition: step.unnamedExpression(),
        assignments,
      };
    });

    return this.handlers.applyScan(this.rows, {
      matchIdColumn,
      partitionBy: ctx.scanOperatorPartitionByClause()?.unnamedExpression() ?? [],
      orderBy: ctx.scanOperatorOrderByClause()?.orderedExpression() ?? [],
      declarations: ctx.scanOperatorDeclareClause()?.scalarParameter() ?? [],
      steps,
    });
  };

  visitLookupOperator = (ctx: LookupOperatorContext): KustoRow[] => {
    const resolver = createTabularSourceResolver(this.handlers);
    const rightRows = resolveTabularSource(ctx.unnamedExpression(), this.handlers.parserOptions, this.rawCommand, resolver);
    return this.handlers.applyLookup(
      this.rows,
      getLookupKind(ctx.relaxedQueryOperatorParameter()),
      rightRows,
      ctx.joinOperatorOnClause().unnamedExpression().map((item) => item.getText()),
    );
  };
}
