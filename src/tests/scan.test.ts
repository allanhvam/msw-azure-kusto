import assert from 'node:assert';
import test from 'node:test';
import { KustoInterpreter } from '../interpreter/index.js';
import { seedTable } from './seed-table.js';

test('scan computes a cumulative sum via a self-referencing step', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute(
    'range x from 1 to 5 step 1 | scan declare (cumulative:long = 0) with (step s: true => cumulative = s.cumulative + x;)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { x: 1, cumulative: 1 },
    { x: 2, cumulative: 3 },
    { x: 3, cumulative: 6 },
    { x: 4, cumulative: 10 },
    { x: 5, cumulative: 15 },
  ]);
});

test('scan fills missing values forward', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Readings', [
    { Idx: 1, Val: 10 },
    { Idx: 2, Val: null },
    { Idx: 3, Val: null },
    { Idx: 4, Val: 40 },
    { Idx: 5, Val: null },
  ]);

  const result = await interpreter.execute(
    'Readings | sort by Idx asc | scan declare (Filled:long = 0) with (step s: true => Filled = coalesce(Val, s.Filled);)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(
    result.rows.map((row) => row.Filled),
    [10, 10, 10, 40, 40],
  );
});

test('scan matches a multi-step event sequence and drops unmatched rows', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Seq: 1, Event: 'Start' },
    { Seq: 2, Event: 'Noise' },
    { Seq: 3, Event: 'Middle' },
    { Seq: 4, Event: 'End' },
  ]);

  const result = await interpreter.execute(
    'Events | sort by Seq asc | scan with (step a: Event == "Start"; step b: Event == "Middle"; step c: Event == "End";)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Seq: 1, Event: 'Start' },
    { Seq: 3, Event: 'Middle' },
    { Seq: 4, Event: 'End' },
  ]);
});

test('scan partitions state independently with partition by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Metrics', [
    { Group: 'a', Idx: 1, Val: 1 },
    { Group: 'b', Idx: 1, Val: 100 },
    { Group: 'a', Idx: 2, Val: 2 },
    { Group: 'b', Idx: 2, Val: 200 },
    { Group: 'a', Idx: 3, Val: 3 },
  ]);

  const result = await interpreter.execute(
    'Metrics | scan order by Idx asc partition by Group declare (Running:long = 0) with (step s: true => Running = s.Running + Val;)',
  );

  assert.equal(result.kind, 'query');
  const byGroup = (group: string) =>
    result.rows.filter((row) => row.Group === group).map((row) => row.Running);
  assert.deepEqual(byGroup('a'), [1, 3, 6]);
  assert.deepEqual(byGroup('b'), [100, 300]);
});

test('scan output=none suppresses rows assigned to a step', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Seq: 1, Event: 'A' },
    { Seq: 2, Event: 'B' },
    { Seq: 3, Event: 'C' },
  ]);

  const result = await interpreter.execute(
    'Events | sort by Seq asc | scan with (step a output=none: Event == "A"; step b: Event == "B"; step c: Event == "C";)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Seq: 2, Event: 'B' },
    { Seq: 3, Event: 'C' },
  ]);
});

test('scan output=last emits only the last row assigned to a step', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Seq: 1, Event: 'A' },
    { Seq: 2, Event: 'A' },
    { Seq: 3, Event: 'B' },
  ]);

  const result = await interpreter.execute(
    'Events | sort by Seq asc | scan with (step a output=last: Event == "A"; step b: Event == "B";)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Seq: 2, Event: 'A' },
    { Seq: 3, Event: 'B' },
  ]);
});

test('scan assigns a match id per detected sequence', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Logins', [
    { Seq: 1, Event: 'Start' },
    { Seq: 2, Event: 'End' },
    { Seq: 3, Event: 'Start' },
    { Seq: 4, Event: 'End' },
  ]);

  const result = await interpreter.execute(
    'Logins | sort by Seq asc | scan with_match_id = MatchId with (step a: Event == "Start"; step b: Event == "End";)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(
    result.rows.map((row) => ({ Seq: row.Seq, MatchId: row.MatchId })),
    [
      { Seq: 1, MatchId: 0 },
      { Seq: 2, MatchId: 0 },
      { Seq: 3, MatchId: 1 },
      { Seq: 4, MatchId: 1 },
    ],
  );
});
