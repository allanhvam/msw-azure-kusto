import type { KustoInterpreter } from '../interpreter/index.js';

function typeForValue(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'real';
  }

  if (typeof value === 'boolean') {
    return 'bool';
  }

  return 'string';
}

export async function seedTable(interpreter: KustoInterpreter, tableName: string, rows: Array<Record<string, unknown>>): Promise<void> {
  if (rows.length === 0) {
    throw new Error('seedTable requires at least one row.');
  }

  const columns = Object.keys(rows[0]);
  const schema = columns
    .map((columnName) => {
      const firstValue = rows.find((row) => row[columnName] !== undefined && row[columnName] !== null)?.[columnName] ?? null;
      return `${columnName}:${typeForValue(firstValue)}`;
    })
    .join(', ');

  await interpreter.execute(`.create table ${tableName} (${schema})`);

  const payload = rows
    .map((row) => JSON.stringify(columns.map((columnName) => row[columnName] ?? null)))
    .join('\n');

  await interpreter.execute(`.ingest inline into table ${tableName} <| ${payload}`);
}
