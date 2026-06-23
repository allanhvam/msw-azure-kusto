import assert from 'node:assert';
import test from 'node:test';
import { KustoInterpreter } from '../interpreter/index.js';

async function evaluatePrint(expression: string): Promise<unknown> {
  const interpreter = new KustoInterpreter();
  const result = await interpreter.execute(`print x = ${expression}`);
  assert.equal(result.kind, 'query');
  return result.rows[0].x;
}

test('ceiling rounds a real value up', async () => {
  assert.equal(await evaluatePrint('ceiling(1.2)'), 2);
});

test('ceiling of a negative real rounds toward zero', async () => {
  assert.equal(await evaluatePrint('ceiling(-1.2)'), -1);
});

test('floor rounds a real value down', async () => {
  assert.equal(await evaluatePrint('floor(1.8)'), 1);
});

test('timespan divided by timespan yields the dimensionless ratio', async () => {
  const value = await evaluatePrint(
    '(datetime(2024-01-01 00:05:30) - datetime(2024-01-01 00:00:00)) / 1m',
  );
  assert.equal(value, 5.5);
});

test('ceiling of a timespan ratio counts whole bins', async () => {
  const value = await evaluatePrint(
    'ceiling((datetime(2024-01-01 00:05:30) - datetime(2024-01-01 00:00:00)) / 1m)',
  );
  assert.equal(value, 6);
});

test('timespan divided by a number yields a timespan', async () => {
  // (1h / 2) is a 30-minute timespan; dividing again by 1m gives the ratio 30.
  assert.equal(await evaluatePrint('(1h / 2) / 1m'), 30);
});
