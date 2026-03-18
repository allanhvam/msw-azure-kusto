import type { KustoRow, KustoExecutionResult } from '../interpreter/index.js';

function typeForValue(value: unknown): string {
  if (value instanceof Date) {
    return 'datetime';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'real';
  }

  if (typeof value === 'boolean') {
    return 'bool';
  }

  if (value === null || value === undefined) {
    return 'string';
  }

  if (Array.isArray(value)) {
    return 'dynamic';
  }

  if (typeof value === 'object') {
    return 'dynamic';
  }

  return 'string';
}

const dataTypeMap: Record<string, string> = {
  string: 'String',
  int: 'Int32',
  long: 'Int64',
  real: 'Double',
  bool: 'Boolean',
  datetime: 'DateTime',
  timespan: 'TimeSpan',
  guid: 'Guid',
  decimal: 'Decimal',
  dynamic: 'Object',
};

function toDataType(columnType: string): string {
  return dataTypeMap[columnType] ?? columnType;
}

export function toKustoTable(name: string, rows: KustoRow[], columnTypes?: Record<string, string>): {
  TableName: string;
  Columns: Array<{ ColumnName: string; DataType: string; ColumnType: string }>;
  Rows: unknown[][];
} {
  const columnNames = rows.length > 0
    ? Object.keys(rows[0])
    : [];

  const columns = columnNames.map((columnName) => {
    const dataType = columnTypes?.[columnName] ?? typeForValue(rows.find((row) => row[columnName] !== undefined)?.[columnName]);

    return {
      ColumnName: columnName,
      DataType: toDataType(dataType),
      ColumnType: dataType,
    };
  });

  const serializedRows = rows.map((row) => columnNames.map((columnName) => row[columnName]));

  return {
    TableName: name,
    Columns: columns,
    Rows: serializedRows,
  };
}

export function toQueryV1Response(result: KustoExecutionResult): { Tables: Array<ReturnType<typeof toKustoTable>> } {
  return {
    Tables: [toKustoTable('Table_0', result.rows, result.columnTypes)],
  };
}

export function toQueryV2Response(result: KustoExecutionResult): Array<
  | { FrameType: 'DataSetHeader'; IsProgressive: false; Version: 'v2.0' }
  | ({ FrameType: 'DataTable'; TableId: number; TableKind: 'PrimaryResult' } & ReturnType<typeof toKustoTable>)
  | { FrameType: 'DataSetCompletion'; HasErrors: false; Cancelled: false }
> {
  return [
    {
      FrameType: 'DataSetHeader',
      IsProgressive: false,
      Version: 'v2.0',
    },
    {
      FrameType: 'DataTable',
      TableId: 0,
      TableKind: 'PrimaryResult',
      ...toKustoTable('Table_0', result.rows, result.columnTypes),
    },
    {
      FrameType: 'DataSetCompletion',
      HasErrors: false,
      Cancelled: false,
    },
  ];
}
