const realNumberPrefix = '__MSW_REAL__';
const realNumberSuffix = '__';

function formatRealNumber(value: number): string {
  return Number.isInteger(value)
    ? value.toFixed(1)
    : String(value);
}

function markRealNumbersInTables(payload: unknown): void {
  if (!payload || typeof payload !== 'object') {
    return;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      markRealNumbersInTables(item);
    }
    return;
  }

  const record = payload as Record<string, unknown>;
  const columns = Array.isArray(record.Columns) ? record.Columns : undefined;
  const rows = Array.isArray(record.Rows) ? record.Rows : undefined;

  if (columns && rows) {
    const realColumnIndexes = columns
      .map((column, index) => {
        const type = (column as { ColumnType?: unknown }).ColumnType;
        return type === 'real' ? index : -1;
      })
      .filter((index) => index >= 0);

    if (realColumnIndexes.length > 0) {
      for (const row of rows) {
        if (!Array.isArray(row)) {
          continue;
        }

        for (const columnIndex of realColumnIndexes) {
          const value = row[columnIndex];
          if (typeof value === 'number' && Number.isFinite(value)) {
            row[columnIndex] = `${realNumberPrefix}${formatRealNumber(value)}${realNumberSuffix}`;
          }
        }
      }
    }
  }

  for (const value of Object.values(record)) {
    markRealNumbersInTables(value);
  }
}

function cloneForSerialization<T>(payload: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(payload);
  }

  return JSON.parse(JSON.stringify(payload)) as T;
}

export function stringifyResponseWithRealFormatting(payload: unknown): string {
  const normalized = cloneForSerialization(payload);
  markRealNumbersInTables(normalized);

  const escapedPrefix = realNumberPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedSuffix = realNumberSuffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const markerPattern = new RegExp(`"${escapedPrefix}([^"\\n]+)${escapedSuffix}"`, 'g');

  return JSON.stringify(normalized).replace(markerPattern, '$1');
}
