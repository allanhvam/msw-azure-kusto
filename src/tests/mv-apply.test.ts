import assert from 'node:assert';
import test from 'node:test';
import { KustoInterpreter } from '../interpreter/index.js';
import { seedTable } from './seed-table.js';

test('mv-apply filters expanded elements within the on subquery', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [1, 2, 3, 4] },
    { Id: 2, Values: [5, 6] },
  ]);

  const result = await interpreter.execute(
    'Events | mv-apply Values on (where Values % 2 == 0) | sort by Id asc, Values asc | project Id, Values',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Values: 2 },
    { Id: 1, Values: 4 },
    { Id: 2, Values: 6 },
  ]);
});

test('mv-apply summarizes per source row and re-attaches source columns', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [3, 1, 2] },
    { Id: 2, Values: [9, 8] },
  ]);

  const result = await interpreter.execute(
    'Events | mv-apply Values on (summarize MaxValue = max(Values)) | sort by Id asc | project Id, MaxValue',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, MaxValue: 3 },
    { Id: 2, MaxValue: 9 },
  ]);
});

test('mv-apply applies top within the subquery per source row', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [3, 1, 2] },
    { Id: 2, Values: [9, 8] },
  ]);

  const result = await interpreter.execute(
    'Events | mv-apply Values on (top 1 by Values desc) | sort by Id asc | project Id, Values',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Values: 3 },
    { Id: 2, Values: 9 },
  ]);
});

test('mv-apply honors the limit clause on the expansion', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [10, 20, 30] },
  ]);

  const result = await interpreter.execute(
    'Events | mv-apply Values limit 2 on (where true) | sort by Values asc | project Id, Values',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Values: 10 },
    { Id: 1, Values: 20 },
  ]);
});
