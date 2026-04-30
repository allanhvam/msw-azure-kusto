export type KustoDynamic = Record<string, unknown> | unknown[];

export type KustoScalar = string | number | boolean | Date | KustoDynamic | KustoScalar[] | null;

export type KustoRow = Record<string, KustoScalar>;

export type KustoExecutionResult = {
  kind: 'query' | 'management';
  rows: KustoRow[];
  columnTypes?: Record<string, string>;
};

export type ExecutionContext = {
  bindings: KustoRow;
  tableBindings: Map<string, KustoRow[]>;
};

export const EMPTY_EXECUTION_CONTEXT: ExecutionContext = Object.freeze({
  bindings: Object.freeze({}) as KustoRow,
  tableBindings: new Map<string, KustoRow[]>(),
}) as ExecutionContext;
