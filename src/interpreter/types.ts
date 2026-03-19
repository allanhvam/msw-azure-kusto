export type KustoDynamic = Record<string, unknown> | unknown[];

export type KustoScalar = string | number | boolean | Date | KustoDynamic | KustoScalar[] | null;

export type KustoRow = Record<string, KustoScalar>;

export type KustoExecutionResult = {
  kind: 'query' | 'management';
  rows: KustoRow[];
  columnTypes?: Record<string, string>;
};
