import type { EntityExpressionContext, UnnamedExpressionContext } from '../parser/KqlParser.js';

export type KustoDynamic = Record<string, unknown> | unknown[];

export type KustoScalar = string | number | boolean | Date | KustoDynamic | null;

export type KustoRow = Record<string, KustoScalar>;

export type KustoExecutionResult = {
  kind: 'query' | 'management';
  rows: KustoRow[];
};

export type QueryOperatorAst =
  | { kind: 'take'; amountExpression: UnnamedExpressionContext }
  | { kind: 'where'; predicateExpression: UnnamedExpressionContext }
  | { kind: 'extend'; expressions: NamedExpressionAst[] }
  | { kind: 'project'; expressions: NamedExpressionAst[] }
  | { kind: 'project-away'; columns: string[] }
  | { kind: 'project-rename'; expressions: NamedExpressionAst[] }
  | { kind: 'count' }
  | { kind: 'distinct'; includeAllColumns: boolean; expressions: NamedExpressionAst[] }
  | { kind: 'sort'; expressions: OrderedExpressionAst[] }
  | { kind: 'top'; amountExpression: UnnamedExpressionContext; by: OrderedExpressionAst }
  | { kind: 'mvexpand'; expressions: NamedExpressionAst[]; limit: number | null }
  | {
      kind: 'make-series';
      aggregations: Array<{
        functionName: 'count' | 'sum' | 'avg' | 'min' | 'max';
        valueExpression: NamedExpressionAst | null;
        alias: string | null;
        defaultExpression: NamedExpressionAst | null;
      }>;
      on: NamedExpressionAst;
      fromExpression: UnnamedExpressionContext;
      toExpression: UnnamedExpressionContext;
      stepExpression: UnnamedExpressionContext;
      by: NamedExpressionAst[];
    }
  | { kind: 'summarize'; aggregations: NamedExpressionAst[]; by: NamedExpressionAst[] }
  | { kind: 'union'; sources: TabularSourceAst[] }
  | { kind: 'join'; joinKind: 'inner' | 'leftouter'; rightSource: TabularSourceAst; on: string[] }
  | { kind: 'lookup'; lookupKind: 'inner' | 'leftouter'; rightSource: TabularSourceAst; on: string[] }
  | { kind: 'partition'; byExpression: EntityExpressionContext; subExpressionOperators: QueryOperatorAst[] };

export type NamedExpressionAst = {
  alias: string | null;
  expression: UnnamedExpressionContext;
};

export type OrderedExpressionAst = {
  expression: NamedExpressionAst;
  descending: boolean;
};

export type BaseSummarizeAggregationAst =
  | { kind: 'count' }
  | { kind: 'countif'; predicateExpression: UnnamedExpressionContext }
  | { kind: 'count_distinct'; valueExpression: UnnamedExpressionContext }
  | { kind: 'make_set'; valueExpression: UnnamedExpressionContext }
  | { kind: 'sum'; valueExpression: UnnamedExpressionContext }
  | { kind: 'avg'; valueExpression: UnnamedExpressionContext }
  | { kind: 'min'; valueExpression: UnnamedExpressionContext }
  | { kind: 'max'; valueExpression: UnnamedExpressionContext };

export type SummarizeAggregationAst =
  | BaseSummarizeAggregationAst
  | {
      kind: 'round';
      valueAggregation: BaseSummarizeAggregationAst;
      precisionExpression: UnnamedExpressionContext | null;
    };

export type QueryAst = {
  source: QuerySourceAst;
  operators: QueryOperatorAst[];
};

export type CommandAst =
  | {
      kind: 'query';
      query: QueryAst;
    }
  | {
      kind: 'management';
      command: string;
      commandName: string;
      argumentsText: string;
      fromQueryPayload: string | null;
      tableName: string | null;
      schemaText: string | null;
      argumentTokens: string[];
    };

export type QuerySourceAst =
  | { kind: 'table'; name: string }
  | { kind: 'datatable'; expressionText: string }
  | { kind: 'union'; sources: TabularSourceAst[] }
  | { kind: 'print'; expressions: NamedExpressionAst[] }
  | {
      kind: 'range';
      columnName: string;
      fromExpression: UnnamedExpressionContext;
      toExpression: UnnamedExpressionContext;
      stepExpression: UnnamedExpressionContext;
    };

export type TabularSourceAst = { kind: 'table'; name: string } | { kind: 'subquery'; query: QueryAst };
