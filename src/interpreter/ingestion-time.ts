import type { KustoRow, KustoScalar } from './types.js';

const INGESTION_TIME_SYMBOL = Symbol('ingestionTime');

type KustoRowWithIngestionTime = KustoRow & { [INGESTION_TIME_SYMBOL]?: string };

export function setRowIngestionTime(row: KustoRow, ingestionTime: string): void {
  Object.defineProperty(row, INGESTION_TIME_SYMBOL, {
    value: ingestionTime,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}

export function getRowIngestionTime(row: KustoRow): KustoScalar {
  const internalRow = row as KustoRowWithIngestionTime;
  return internalRow[INGESTION_TIME_SYMBOL] ?? null;
}
