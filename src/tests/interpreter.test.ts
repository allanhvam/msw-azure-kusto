import assert from 'node:assert';
import test from 'node:test';
import { KustoInterpreter } from '../interpreter/index.js';
import { seedTable } from './seed-table.js';

test('interprets take operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute('Events | take 2');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
  ]);
});

test('interprets where and project operators', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute('Events | where Value >= 20 | project Id, Score = Value');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 2, Score: 20 },
    { Id: 3, Score: 30 },
  ]);
});

test('interprets between and not between predicates', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const betweenResult = await interpreter.execute('Events | where Value between (15 .. 30) | sort by Id asc | project Id');
  assert.equal(betweenResult.kind, 'query');
  assert.deepEqual(betweenResult.rows, [{ Id: 2 }, { Id: 3 }]);

  const notBetweenResult = await interpreter.execute('Events | where Value !between (15 .. 30) | sort by Id asc | project Id');
  assert.equal(notBetweenResult.kind, 'query');
  assert.deepEqual(notBetweenResult.rows, [{ Id: 1 }]);
});

test('interprets in and not in predicates', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Type: 'Flood' },
    { Id: 2, Type: 'Tornado' },
    { Id: 3, Type: 'Hail' },
  ]);

  const inResult = await interpreter.execute('Events | where Type in ("Flood", "Hail") | sort by Id asc | project Id');
  assert.equal(inResult.kind, 'query');
  assert.deepEqual(inResult.rows, [{ Id: 1 }, { Id: 3 }]);

  const notInResult = await interpreter.execute('Events | where Type !in ("Flood", "Hail") | sort by Id asc | project Id');
  assert.equal(notInResult.kind, 'query');
  assert.deepEqual(notInResult.rows, [{ Id: 2 }]);
});

test('interprets project-away operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10, ValueExtra: 100, Keep: 'A' },
    { Id: 2, Value: 20, ValueExtra: 200, Keep: 'B' },
  ]);

  const result = await interpreter.execute('Events | project-away Value, Value* | sort by Id asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Keep: 'A' },
    { Id: 2, Keep: 'B' },
  ]);
});

test('interprets project-rename operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Subject: 'A' },
    { Id: 2, Subject: 'B' },
  ]);

  const result = await interpreter.execute('Events | project-rename MeetingId=Id, Title=Subject | sort by MeetingId asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { MeetingId: 1, Title: 'A' },
    { MeetingId: 2, Title: 'B' },
  ]);
});

test('interprets extend with arithmetic', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [{ Id: 1, Value: 5 }]);

  const result = await interpreter.execute('Events | extend Total = Value * 2 + 1 | project Total');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Total: 11 }]);
});

test('interprets integer division with truncation', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [{ Id: 1, Numerator: 5, Denominator: 2 }]);

  const result = await interpreter.execute('Events | project Ratio = Numerator / Denominator');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Ratio: 2 }]);
});

test('ingests inline rows using management command', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Events (Id:int, Value:int)');
  await interpreter.execute('.ingest inline into table Events <| 1,10\n2,20');

  const result = await interpreter.execute('Events | project Id, Value');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
  ]);
});

test('ingests inline rows using management command with with-clause', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Events (Id:int, Value:int)');
  await interpreter.execute('.ingest inline into table Events with (format = "json") <| 1,10\n2,20');

  const result = await interpreter.execute('Events | project Id, Value');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
  ]);
});

test('ingests rows from uri source command', async () => {
  const interpreter = new KustoInterpreter();
  const source = 'data:text/csv,EventId%2CState%2CDamage%0A1%2CWA%2C10%0A2%2CCA%2C20%0A3%2CWA%2C5';

  await interpreter.execute('.create table StormEvents (EventId:int, State:string, Damage:int)');
  await interpreter.execute(`.ingest into table StormEvents ('${source}')`);

  const result = await interpreter.execute('StormEvents | where State == "WA" | project EventId, State | sort by EventId asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { EventId: 1, State: 'WA' },
    { EventId: 3, State: 'WA' },
  ]);
});

test('ingests rows from uri source command with ignoreFirstRecord option', async () => {
  const interpreter = new KustoInterpreter();
  const source = 'data:text/csv,EventId%2CState%2CDamage%0A1%2CWA%2C10%0A2%2CCA%2C20%0A3%2CWA%2C5';

  await interpreter.execute('.create table StormEvents (EventId:int, State:string, Damage:int)');
  await interpreter.execute(`.ingest into table StormEvents ('${source}') with (format='csv', ignoreFirstRecord=true)`);

  const result = await interpreter.execute('StormEvents | count');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Count: 3 }]);
});

test('ingests datetime columns as Date objects', async () => {
  const interpreter = new KustoInterpreter();
  const source = 'data:text/csv,StartTime%2CValue%0A2007-01-01%2000%3A00%3A00.0000000%2C1';

  await interpreter.execute('.create table Events (StartTime:datetime, Value:int)');
  await interpreter.execute(`.ingest into table Events ('${source}') with (format='csv', ignoreFirstRecord=true)`);
  await interpreter.execute('.ingest inline into table Events <| 2007-01-02 00:00:00.0000000,2');

  const result = await interpreter.execute('Events | sort by StartTime asc | project StartTime, Value');

  assert.equal(result.kind, 'query');
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].StartTime instanceof Date, true);
  assert.equal(result.rows[1].StartTime instanceof Date, true);
  assert.equal((result.rows[0].StartTime as Date).toISOString(), '2007-01-01T00:00:00.000Z');
  assert.equal((result.rows[1].StartTime as Date).toISOString(), '2007-01-02T00:00:00.000Z');
});

test('compares ingested datetime Date values to datetime literal with ==', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Events (Id:int, StartTime:datetime)');
  await interpreter.execute('.ingest inline into table Events <| 1,2007-01-01 00:00:00.0000000\n2,2007-01-02 00:00:00.0000000');

  const result = await interpreter.execute(
    'Events | where StartTime == datetime(2007-01-01 00:00:00) | sort by Id asc | project Id',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 1 }]);
});

test('compares ingested datetime Date values to datetime literal with !=', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Events (Id:int, StartTime:datetime)');
  await interpreter.execute('.ingest inline into table Events <| 1,2007-01-01 00:00:00.0000000\n2,2007-01-02 00:00:00.0000000');

  const result = await interpreter.execute(
    'Events | where StartTime != datetime(2007-01-01 00:00:00) | sort by Id asc | project Id',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 2 }]);
});

test('ingests missing string values as empty string', async () => {
  const interpreter = new KustoInterpreter();
  const source = 'data:text/csv,Id%2CName%0A1%2C%0A2%2CAlice';

  await interpreter.execute('.create table Events (Id:int, Name:string)');
  await interpreter.execute(`.ingest into table Events ('${source}') with (format='csv', ignoreFirstRecord=true)`);

  const result = await interpreter.execute('Events | sort by Id asc | project Id, Name');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Name: '' },
    { Id: 2, Name: 'Alice' },
  ]);
});

test('ingests dynamic JSON values as objects', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Events (Id:int, Payload:dynamic)');
  await interpreter.execute('.ingest inline into table Events <| [1,{"foo":"bar","count":2}]');

  const result = await interpreter.execute('Events | project Id, Payload');

  assert.equal(result.kind, 'query');
  assert.equal(typeof result.rows[0].Payload, 'object');
  assert.deepEqual(result.rows, [
    { Id: 1, Payload: { foo: 'bar', count: 2 } },
  ]);
});

test('supports ingestion_time()', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Events (Id:int, Value:int)');
  await interpreter.execute('.ingest inline into table Events <| 1,10\n2,20');

  const result = await interpreter.execute('Events | project Id, IngestionTime = ingestion_time() | sort by Id asc');

  assert.equal(result.kind, 'query');
  assert.equal(result.rows.length, 2);
  assert.equal(typeof result.rows[0].IngestionTime, 'string');
  assert.match(String(result.rows[0].IngestionTime), /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(result.rows[0].IngestionTime, result.rows[1].IngestionTime);
});

test('drops table with ifexists when table is missing', async () => {
  const interpreter = new KustoInterpreter();

  const dropResult = await interpreter.execute('.drop table Missing ifexists');
  assert.equal(dropResult.kind, 'management');
  assert.deepEqual(dropResult.rows, [{ Status: 'TableNotFound', Table: 'Missing' }]);

  const showTables = await interpreter.execute('.show tables');
  assert.equal(showTables.kind, 'management');
  assert.deepEqual(showTables.rows, []);
});

test('drop table without ifexists fails when table is missing', async () => {
  const interpreter = new KustoInterpreter();

  await assert.rejects(
    async () => interpreter.execute('.drop table Missing'),
    /Table does not exist: Missing/,
  );
});

test('shows database name with show database', async () => {
  const interpreter = new KustoInterpreter({ databaseName: 'TestDb' });

  const result = await interpreter.execute('.show database');

  assert.equal(result.kind, 'management');
  assert.deepEqual(result.rows, [{ DatabaseName: 'TestDb' }]);
});

test('shows tables with database name', async () => {
  const interpreter = new KustoInterpreter({ databaseName: 'TestDb' });
  await interpreter.execute('.create table Events (Id:int)');

  const result = await interpreter.execute('.show tables');

  assert.equal(result.kind, 'management');
  assert.deepEqual(result.rows, [{ TableName: 'Events', DatabaseName: 'TestDb' }]);
});

test('supports let statement with scalar variables', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute(
    'let base = 10; let threshold = base + 5; Events | where Value > threshold | project Id | sort by Id asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 2 }, { Id: 3 }]);
});

test('supports toscalar in let scalar assignment', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'StormEvents', [
    { EventType: 'Flood' },
    { EventType: 'Flood' },
    { EventType: 'Hail' },
  ]);

  const result = await interpreter.execute(
    'let TotalStorms = toscalar(StormEvents | summarize count()); StormEvents | summarize EventCount = count() by EventType | project EventType, EventCount, Percentage = todouble(EventCount) / TotalStorms * 100.0 | sort by EventType asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { EventType: 'Flood', EventCount: 2, Percentage: 66.66666666666666 },
    { EventType: 'Hail', EventCount: 1, Percentage: 33.33333333333333 },
  ]);
});

test('supports dynamic bag lookup in let scalar using column key', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'StormEvents', [
    { EventId: 1, Source: 'Emergency Manager' },
    { EventId: 2, Source: 'Utility Company' },
  ]);

  const query = `let sourceMapping = dynamic(
  {
    "Emergency Manager" : "Public",
    "Utility Company" : "Private"
  });
StormEvents
| where Source == "Emergency Manager" or Source == "Utility Company"
| project EventId, Source, FriendlyName = sourceMapping[Source]
| sort by EventId asc`;

  const result = await interpreter.execute(query);

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { EventId: 1, Source: 'Emergency Manager', FriendlyName: 'Public' },
    { EventId: 2, Source: 'Utility Company', FriendlyName: 'Private' },
  ]);
});

test('supports let statement with tabular assignment', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Meetings', [
    { Id: 1, User: 'a', Value: 10 },
    { Id: 2, User: 'b', Value: 20 },
    { Id: 3, User: 'b', Value: 30 },
  ]);

  const result = await interpreter.execute(
    'let events = Meetings | where User == "b" | project Id, Value; events | sort by Id asc | project Id, Value',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);
});

test('supports let statement with tabular assignment without pipe', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Meetings', [
    { Id: 1, User: 'a' },
    { Id: 2, User: 'b' },
    { Id: 3, User: 'b' },
  ]);

  const result = await interpreter.execute('let x = Meetings; x | count');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Count: 3 }]);
});

test('supports let statement with datatable tabular assignment', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute(`let StormEvents = datatable(EventId:int, State:string, DamageProperty:long)
[
  1, "California", 1500000,
  2, "Texas", 500000,
  3, "Florida", 900000
];
let StateDetails = datatable(State:string, Region:string)
[
  "California", "West",
  "Texas", "South",
  "Florida", "South",
  "Ohio", "Midwest"
];
StormEvents
| join kind=inner (StateDetails) on State
| project EventId, State, Region, DamageProperty
| order by EventId asc`);

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { EventId: 1, State: 'California', Region: 'West', DamageProperty: 1500000 },
    { EventId: 2, State: 'Texas', Region: 'South', DamageProperty: 500000 },
    { EventId: 3, State: 'Florida', Region: 'South', DamageProperty: 900000 },
  ]);
});

test('supports let statement with materialize tabular assignment', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute(`let FilteredData = materialize(
  datatable(State:string, DamageProperty:long)
  [
    "California", 1500000,
    "California", 500000,
    "Texas", 250000
  ]
  | where State == "California"
);
FilteredData
| summarize TotalDamage = sum(DamageProperty), AverageDamage = avg(DamageProperty)`);

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { TotalDamage: 2000000, AverageDamage: 1000000 },
  ]);
});

test('supports scalar and tabular let in same script', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Meetings', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute(
    'let threshold = 15; let events = Meetings | where Value > threshold | project Id, Value; events | sort by Id asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);
});

test('supports scalar let statement without pipe unchanged', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute('let threshold = 15; Events | where Value > threshold | count');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Count: 2 }]);
});

test('supports set statement before query', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
  ]);

  const result = await interpreter.execute('set query_take_max_records = 100; Events | project Id | sort by Id asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 1 }, { Id: 2 }]);
});

test('interprets datatable query source', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute(`datatable(State:string, EventType:string, DamageProperty:long)
[
  "California", "Flood", 1500000,
  "Texas", "Hail", 500000,
  "California", "Wildfire", 2500000
]
| where State == "California"
| project EventType, State, DamageProperty
| order by DamageProperty desc`);

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { EventType: 'Wildfire', State: 'California', DamageProperty: 2500000 },
    { EventType: 'Flood', State: 'California', DamageProperty: 1500000 },
  ]);
  assert.deepEqual(result.columnTypes, {
    EventType: 'string',
    State: 'string',
    DamageProperty: 'long',
  });
});

test('prefers created table schema types for query column types', async () => {
  const interpreter = new KustoInterpreter();

  await interpreter.execute('.create table Metrics (Id:long, Name:string)');
  await interpreter.execute('.ingest inline into table Metrics <| 1,alpha');

  const result = await interpreter.execute('Metrics | project Id, Name');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 1, Name: 'alpha' }]);
  assert.deepEqual(result.columnTypes, {
    Id: 'long',
    Name: 'string',
  });
});

test('interprets count operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1 },
    { Id: 2 },
    { Id: 3 },
  ]);

  const result = await interpreter.execute('Events | count');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Count: 3 }]);
});

test('interprets distinct operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, State: 'WA' },
    { Id: 2, State: 'CA' },
    { Id: 3, State: 'WA' },
  ]);

  const result = await interpreter.execute('Events | distinct State');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { State: 'WA' },
    { State: 'CA' },
  ]);
});

test('interprets sort and top operators', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 30 },
    { Id: 3, Value: 20 },
  ]);

  const sorted = await interpreter.execute('Events | sort by Value desc');
  assert.equal(sorted.kind, 'query');
  assert.deepEqual(sorted.rows.map((row) => row.Id), [2, 3, 1]);

  const top = await interpreter.execute('Events | top 2 by Value desc | project Id, Value');
  assert.equal(top.kind, 'query');
  assert.deepEqual(top.rows, [
    { Id: 2, Value: 30 },
    { Id: 3, Value: 20 },
  ]);

  const sortedDefault = await interpreter.execute('Events | sort by Value');
  assert.equal(sortedDefault.kind, 'query');
  assert.deepEqual(sortedDefault.rows.map((row) => row.Id), [2, 3, 1]);
});

test('interprets summarize count by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, State: 'WA' },
    { Id: 2, State: 'CA' },
    { Id: 3, State: 'WA' },
  ]);

  const result = await interpreter.execute('Events | summarize Total = count() by State | sort by State asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { State: 'CA', Total: 1 },
    { State: 'WA', Total: 2 },
  ]);
});

test('interprets summarize countif by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, State: 'WA', Value: 10 },
    { Id: 2, State: 'CA', Value: 20 },
    { Id: 3, State: 'WA', Value: 30 },
  ]);

  const result = await interpreter.execute(
    'Events | summarize Total = count(), High = countif(Value >= 20) by State | sort by State asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { State: 'CA', Total: 1, High: 1 },
    { State: 'WA', Total: 2, High: 1 },
  ]);
});

test('interprets summarize countif without by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute('Events | summarize High = countif(Value > 10)');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ High: 2 }]);
});

test('interprets summarize count_distinct by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, State: 'WA', UserId: 'u1' },
    { Id: 2, State: 'WA', UserId: 'u2' },
    { Id: 3, State: 'WA', UserId: 'u2' },
    { Id: 4, State: 'CA', UserId: 'u3' },
    { Id: 5, State: 'CA', UserId: 'u3' },
  ]);

  const result = await interpreter.execute('Events | summarize DistinctUsers = count_distinct(UserId) by State | sort by State asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { State: 'CA', DistinctUsers: 1 },
    { State: 'WA', DistinctUsers: 2 },
  ]);
});

test('interprets summarize count_distinct without by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, UserId: 'u1' },
    { Id: 2, UserId: 'u2' },
    { Id: 3, UserId: 'u2' },
    { Id: 4, UserId: 'u3' },
  ]);

  const result = await interpreter.execute('Events | summarize DistinctUsers = count_distinct(UserId)');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ DistinctUsers: 3 }]);
});

test('interprets summarize make_set by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { State: 'WA', EventType: 'Flood' },
    { State: 'WA', EventType: 'Hail' },
    { State: 'WA', EventType: 'Flood' },
    { State: 'CA', EventType: 'Tornado' },
  ]);

  const result = await interpreter.execute(
    'Events | summarize StormTypes = make_set(EventType) by State | sort by State asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { State: 'CA', StormTypes: ['Tornado'] },
    { State: 'WA', StormTypes: ['Flood', 'Hail'] },
  ]);
});

test('interprets summarize sum avg min max by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, State: 'WA', Value: 10 },
    { Id: 2, State: 'CA', Value: 20 },
    { Id: 3, State: 'WA', Value: 30 },
  ]);

  const result = await interpreter.execute(
    'Events | summarize Total = sum(Value), Average = avg(Value), Lowest = min(Value), Highest = max(Value) by State | sort by State asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { State: 'CA', Total: 20, Average: 20, Lowest: 20, Highest: 20 },
    { State: 'WA', Total: 40, Average: 20, Lowest: 10, Highest: 30 },
  ]);
});

test('interprets summarize sum avg min max without by', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute(
    'Events | summarize Total = sum(Value), Average = avg(Value), Lowest = min(Value), Highest = max(Value)',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Total: 60, Average: 20, Lowest: 10, Highest: 30 }]);
});

test('interprets summarize round of avg aggregation', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Group: 'A', Value: 1 },
    { Group: 'A', Value: 2 },
    { Group: 'A', Value: 2 },
  ]);

  const result = await interpreter.execute('Events | summarize AvgRounded = round(avg(Value), 2) by Group');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Group: 'A', AvgRounded: 1.67 }]);
});

test('interprets summarize default aggregation names', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Group: 'A', Value: 1 },
    { Group: 'A', Value: 2 },
    { Group: 'A', Value: 2 },
  ]);

  const result = await interpreter.execute('Events | summarize min(Value), max(Value), round(avg(Value)) by Group');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Group: 'A', min_Value: 1, max_Value: 2, avg_Value: 2 }]);
});

test('interprets mv-expand operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [10, 20] as unknown as string },
    { Id: 2, Values: [30] as unknown as string },
  ]);

  const result = await interpreter.execute('Events | mv-expand Values | sort by Id asc, Values asc | project Id, Values');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Values: 10 },
    { Id: 1, Values: 20 },
    { Id: 2, Values: 30 },
  ]);
});

test('interprets mv-expand operator with limit', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [10, 20, 30] as unknown as string },
  ]);

  const result = await interpreter.execute('Events | mv-expand Values limit 2 | sort by Values asc | project Id, Values');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Values: 10 },
    { Id: 1, Values: 20 },
  ]);
});

test('interprets scalar range function with mv-expand', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [{ Id: 1 }]);

  const result = await interpreter.execute('Events | extend Slots = range(1, 3, 1) | mv-expand Slots | sort by Slots asc | project Slots');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Slots: 1 }, { Slots: 2 }, { Slots: 3 }]);
});

test('interprets range expression with numeric values', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute('range i from 1 to 5 step 2 | sort by i asc | project i');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ i: 1 }, { i: 3 }, { i: 5 }]);
});

test('interprets range expression with datetime values', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute(
    'range ts from datetime(2024-01-01T00:00:00Z) to datetime(2024-01-03T00:00:00Z) step 1d | sort by ts asc | project ts',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { ts: '2024-01-01T00:00:00.000Z' },
    { ts: '2024-01-02T00:00:00.000Z' },
    { ts: '2024-01-03T00:00:00.000Z' },
  ]);
});

test('interprets print query source expression', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute('print Message = "test"');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Message: 'test' }]);
});

test('interprets bin function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 3 },
    { Id: 2, Value: 14 },
    { Id: 3, Value: 29 },
  ]);

  const result = await interpreter.execute('Events | extend Bucket = bin(Value, 10) | sort by Id asc | project Id, Bucket');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Bucket: 0 },
    { Id: 2, Bucket: 10 },
    { Id: 3, Bucket: 20 },
  ]);
});

test('interprets summarize by bin function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { BeginTime: '2024-01-01T00:15:00.000Z' },
    { BeginTime: '2024-01-01T00:45:00.000Z' },
    { BeginTime: '2024-01-01T01:05:00.000Z' },
  ]);

  const result = await interpreter.execute('Events | summarize Count = count() by bin(BeginTime, 1h) | sort by BeginTime asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { BeginTime: '2024-01-01T00:00:00.000Z', Count: 2 },
    { BeginTime: '2024-01-01T01:00:00.000Z', Count: 1 },
  ]);
});

test('bin(datetime, 7d) anchors at year 0001 (Monday-aligned, matches real ADX)', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Ts: '2007-01-03T10:30:00.000Z' },
  ]);

  const result = await interpreter.execute('Events | extend Bucket = bin(Ts, 7d) | project Bucket');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Bucket: '2007-01-01T00:00:00.000Z' }]);
});

test('interprets datetime_add function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Ts: '2024-01-01T00:00:00.000Z' },
  ]);

  const result = await interpreter.execute('Events | extend Next = datetime_add("day", 2, Ts) | project Next');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Next: '2024-01-03T00:00:00.000Z' }]);
});

test('interprets todatetime function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Raw: '2024-01-01T12:30:00Z' },
  ]);

  const result = await interpreter.execute('Events | extend Parsed = todatetime(Raw) | project Parsed');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Parsed: '2024-01-01T12:30:00.000Z' }]);
});

test('interprets todatetime function invalid input as null', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Raw: 'not-a-date' },
  ]);

  const result = await interpreter.execute('Events | extend Parsed = todatetime(Raw) | project Parsed');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Parsed: null }]);
});

test('interprets todouble function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Raw: '12.5' },
  ]);

  const result = await interpreter.execute('Events | extend Parsed = todouble(Raw) | project Parsed');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Parsed: 12.5 }]);
});

test('interprets todouble function invalid input as null', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Raw: 'not-a-number' },
  ]);

  const result = await interpreter.execute('Events | extend Parsed = todouble(Raw) | project Parsed');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Parsed: null }]);
});

test('interprets round function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Numerator: 1, Denominator: 3 },
  ]);

  const result = await interpreter.execute(
    'Events | extend Percent = round((todouble(Numerator) / Denominator * 100), 2) | project Percent',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Percent: 33.33 }]);
});

test('interprets array_length function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Values: [10, 20, 30] as unknown as string },
  ]);

  const result = await interpreter.execute('Events | extend Len = array_length(Values) | project Len');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Len: 3 }]);
});

test('interprets case function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Value: 0 },
    { Value: 10 },
    { Value: 100 },
  ]);

  const result = await interpreter.execute(
    'Events | extend Size = case(Value > 50, "Large", Value > 0, "Medium", "None") | sort by Value asc | project Value, Size',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Value: 0, Size: 'None' },
    { Value: 10, Size: 'Medium' },
    { Value: 100, Size: 'Large' },
  ]);
});

test('interprets iff function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Value: 0 },
    { Value: 2 },
  ]);

  const result = await interpreter.execute('Events | extend Label = iff(Value > 0, "yes", "no") | sort by Value asc | project Label');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Label: 'no' }, { Label: 'yes' }]);
});

test('interprets startofday and bin_at functions', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Ts: '2024-01-02T15:42:00Z' },
  ]);

  const result = await interpreter.execute(
    'Events | extend Day = startofday(Ts), Bucket = bin_at(Ts, 1d, datetime(2024-01-01T00:00:00Z)) | project Day, Bucket',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{
    Day: '2024-01-02T00:00:00.000Z',
    Bucket: '2024-01-02T00:00:00.000Z',
  }]);
});

test('interprets datetime plus timespan arithmetic', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute('print End = datetime(2024-01-01T00:00:00Z) + 7d');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ End: '2024-01-08T00:00:00.000Z' }]);
});

test('interprets not function in where', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, IsAllDay: true },
    { Id: 2, IsAllDay: false },
    { Id: 3, IsAllDay: false },
  ]);

  const result = await interpreter.execute('Events | where not(IsAllDay) | sort by Id asc | project Id');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 2 }, { Id: 3 }]);
});

test('interprets not function in extend', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [{ Id: 1, IsDraft: false }]);

  const result = await interpreter.execute('Events | extend IsPublished = not(IsDraft) | project IsPublished');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ IsPublished: true }]);
});

test('interprets union operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'LeftEvents', [
    { Id: 1, Source: 'L' },
    { Id: 2, Source: 'L' },
  ]);
  await seedTable(interpreter, 'RightEvents', [
    { Id: 3, Source: 'R' },
  ]);

  const result = await interpreter.execute('LeftEvents | union RightEvents | sort by Id asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, Source: 'L' },
    { Id: 2, Source: 'L' },
    { Id: 3, Source: 'R' },
  ]);
});

test('interprets union operator with parenthesized subqueries', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Type: 'occurrence' },
    { Id: 2, Type: 'seriesMaster' },
    { Id: 3, Type: 'exception' },
  ]);

  const result = await interpreter.execute(
    'union (Events | where Type == "occurrence" | project Id), (Events | where Type != "occurrence" | project Id) | sort by Id asc',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1 },
    { Id: 2 },
    { Id: 3 },
  ]);
});

test('interprets let + partition + union subqueries with join', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Meetings', [
    {
      User: 'user',
      Id: 1,
      SeriesMasterId: 10,
      Type: 'occurrence',
      IsAllDay: false,
      IsDraft: false,
      IsCancelled: false,
      Attendees: 3,
      Subject: 'occurrence',
    },
    {
      User: 'user',
      Id: 2,
      SeriesMasterId: null,
      Type: 'exception',
      IsAllDay: false,
      IsDraft: false,
      IsCancelled: false,
      Attendees: 2,
      Subject: 'single',
    },
    {
      User: 'user',
      Id: 10,
      SeriesMasterId: null,
      Type: 'seriesMaster',
      IsAllDay: false,
      IsDraft: false,
      IsCancelled: false,
      Attendees: 5,
      Subject: 'master',
    },
  ]);

  const result = await interpreter.execute(`let events = Meetings
| where User == "user"
| extend IngestionTime = ingestion_time()
| partition hint.strategy=native by Id
  (
    top 1 by IngestionTime desc
  )
| project-away IngestionTime;
let masters = events | where Type == "seriesMaster" | project MasterId = Id, MasterSubject = Subject;
union
  (events | where Type != "occurrence"),
  (events | where Type == "occurrence")
| join kind=leftouter (masters) on $left.SeriesMasterId == $right.MasterId
| where Type != "seriesMaster"
| where not(IsAllDay) and not(IsDraft) and not(IsCancelled) and Attendees >= 2
| count`);

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Count: 2 }]);
});

test('interprets partition by with subexpression', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Key: 'A', Score: 10 },
    { Id: 2, Key: 'A', Score: 20 },
    { Id: 3, Key: 'B', Score: 5 },
    { Id: 4, Key: 'B', Score: 15 },
  ]);

  const result = await interpreter.execute('Events | partition by Key (top 1 by Score desc) | sort by Key asc | project Key, Score');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Key: 'A', Score: 20 },
    { Key: 'B', Score: 15 },
  ]);
});

test('interprets join operator (inner and leftouter)', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);
  await seedTable(interpreter, 'States', [
    { Id: 2, State: 'CA' },
    { Id: 3, State: 'WA' },
  ]);

  const inner = await interpreter.execute('Events | join kind=inner (States) on Id | sort by Id asc | project Id, State');
  assert.equal(inner.kind, 'query');
  assert.deepEqual(inner.rows, [
    { Id: 2, State: 'CA' },
    { Id: 3, State: 'WA' },
  ]);

  const leftOuter = await interpreter.execute(
    'Events | join kind=leftouter (States) on Id | sort by Id asc | project Id, Value, State',
  );
  assert.equal(leftOuter.kind, 'query');
  assert.deepEqual(leftOuter.rows, [
    { Id: 1, Value: 10, State: null },
    { Id: 2, Value: 20, State: 'CA' },
    { Id: 3, Value: 30, State: 'WA' },
  ]);
});

test('interprets join operator with right-side subquery', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'StormEvents', [
    { EventId: 1, State: 'WA', EventType: 'Lightning' },
    { EventId: 2, State: 'WA', EventType: 'Avalanche' },
    { EventId: 3, State: 'CA', EventType: 'Lightning' },
    { EventId: 4, State: 'UT', EventType: 'Avalanche' },
  ]);

  const result = await interpreter.execute(`StormEvents
| where EventType == "Lightning"
| distinct State
| join kind=inner (
    StormEvents
    | where EventType == "Avalanche"
    | distinct State
    )
    on State
| project State`);

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ State: 'WA' }]);
});

test('interprets join operator with $left/$right and duplicate column suffixes', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Meetings', [
    { id: 1, seriesMasterId: 10, type: 'occurrence', createdDateTime: 'occurrence' },
    { id: 10, type: 'seriesMaster', createdDateTime: 'master' },
  ]);

  const result = await interpreter.execute(
    'Meetings | where type == "occurrence" | join kind=leftouter (Meetings) on $left.seriesMasterId == $right.id | project id, id1, createdDateTime, createdDateTime1',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    {
      id: 1,
      id1: 10,
      createdDateTime: 'occurrence',
      createdDateTime1: 'master',
    },
  ]);
});

test('interprets datetime between predicates', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Start: '2026-02-24T12:00:00.000Z' },
    { Id: 2, Start: '2026-03-01T12:00:00.000Z' },
  ]);

  const result = await interpreter.execute(
    'Events | where Start between (datetime(2026-02-23) .. datetime(2026-02-28)) | sort by Id asc | project Id',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 1 }]);
});

test('interprets datetime between predicates with space datetime literals', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Start: '2007-07-31T23:15:00.000Z' },
    { Id: 2, Start: '2007-08-01T00:00:00.000Z' },
  ]);

  const result = await interpreter.execute(
    'Events | where Start between (datetime(2007-08-01 00:00:00) .. datetime(2007-08-30 23:59:59)) | sort by Id asc | project Id',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 2 }]);
});

test('interprets datetime range function with mv-expand', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Start: '2026-02-24T10:00:00.000Z', End: '2026-02-24T10:03:00.000Z' },
  ]);

  const result = await interpreter.execute(
    'Events | mv-expand Minute = range(bin(Start, 1m), datetime_add("minute", -1, End), 1m) | summarize MeetingMinutes = count()',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ MeetingMinutes: 3 }]);
});

test('interprets date component functions', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [{ Id: 1 }]);

  const result = await interpreter.execute(
    'Events | project Y = year(datetime(2026-03-08 14:35:59)), M = month(datetime(2026-03-08 14:35:59)), D = day(datetime(2026-03-08 14:35:59)), H = hour(datetime(2026-03-08 14:35:59)), Min = minute(datetime(2026-03-08 14:35:59)), Dow = dayofweek(datetime(2026-03-08 14:35:59))',
  );

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Y: 2026, M: 3, D: 8, H: 14, Min: 35, Dow: 0 }]);
});

test('interprets now and ago functions', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [{ Id: 1 }]);

  const result = await interpreter.execute('Events | project IsRecent = now() > ago(1d)');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ IsRecent: true }]);
});

test('interprets lookup operator', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, StateId: 10 },
    { Id: 2, StateId: 20 },
    { Id: 3, StateId: 30 },
  ]);
  await seedTable(interpreter, 'States', [
    { StateId: 10, Name: 'WA' },
    { StateId: 20, Name: 'CA' },
  ]);

  const leftOuter = await interpreter.execute(
    'Events | lookup kind=leftouter (States) on StateId | sort by Id asc | project Id, StateId, Name',
  );
  assert.equal(leftOuter.kind, 'query');
  assert.deepEqual(leftOuter.rows, [
    { Id: 1, StateId: 10, Name: 'WA' },
    { Id: 2, StateId: 20, Name: 'CA' },
    { Id: 3, StateId: 30, Name: null },
  ]);

  const inner = await interpreter.execute(
    'Events | lookup kind=inner (States) on StateId | sort by Id asc | project Id, StateId, Name',
  );
  assert.equal(inner.kind, 'query');
  assert.deepEqual(inner.rows, [
    { Id: 1, StateId: 10, Name: 'WA' },
    { Id: 2, StateId: 20, Name: 'CA' },
  ]);
});

test('interprets string operators (contains, startswith, endswith, has)', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Name: 'Thunderstorm Wind' },
    { Id: 2, Name: 'Hail' },
    { Id: 3, Name: 'Flash Flood' },
    { Id: 4, Name: 'Winter Storm' },
  ]);

  const containsResult = await interpreter.execute("Events | where Name contains 'storm' | sort by Id asc | project Id");
  assert.deepEqual(containsResult.rows, [{ Id: 1 }, { Id: 4 }]);

  const startsWithResult = await interpreter.execute("Events | where Name startswith 'flash' | project Id");
  assert.deepEqual(startsWithResult.rows, [{ Id: 3 }]);

  const endsWithResult = await interpreter.execute("Events | where Name endswith 'wind' | project Id");
  assert.deepEqual(endsWithResult.rows, [{ Id: 1 }]);

  const hasResult = await interpreter.execute("Events | where Name has 'hail' | project Id");
  assert.deepEqual(hasResult.rows, [{ Id: 2 }]);

  const notContainsResult = await interpreter.execute("Events | where Name !contains 'storm' | sort by Id asc | project Id");
  assert.deepEqual(notContainsResult.rows, [{ Id: 2 }, { Id: 3 }]);

  const caseInsensitiveEq = await interpreter.execute("Events | where Name =~ 'hail' | project Id");
  assert.deepEqual(caseInsensitiveEq.rows, [{ Id: 2 }]);

  const matchesRegex = await interpreter.execute("Events | where Name matches regex 'Storm|Flood' | sort by Id asc | project Id");
  assert.deepEqual(matchesRegex.rows, [{ Id: 3 }, { Id: 4 }]);
});

test('interprets string functions (strlen, toupper, tolower, substring)', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Name: 'Hello World' },
  ]);

  const strlenResult = await interpreter.execute('Events | project Id, Len = strlen(Name)');
  assert.deepEqual(strlenResult.rows, [{ Id: 1, Len: 11 }]);

  const toupperResult = await interpreter.execute('Events | project Id, Upper = toupper(Name)');
  assert.deepEqual(toupperResult.rows, [{ Id: 1, Upper: 'HELLO WORLD' }]);

  const tolowerResult = await interpreter.execute('Events | project Id, Lower = tolower(Name)');
  assert.deepEqual(tolowerResult.rows, [{ Id: 1, Lower: 'hello world' }]);

  const substringResult = await interpreter.execute('Events | project Id, Sub = substring(Name, 6, 5)');
  assert.deepEqual(substringResult.rows, [{ Id: 1, Sub: 'World' }]);

  const substringNoLength = await interpreter.execute('Events | project Id, Sub = substring(Name, 6)');
  assert.deepEqual(substringNoLength.rows, [{ Id: 1, Sub: 'World' }]);
});

test('interprets split, strcat, and indexof functions', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Path: 'a/b/c' },
  ]);

  const splitResult = await interpreter.execute("Events | project Id, Parts = split(Path, '/')");
  assert.deepEqual(splitResult.rows, [{ Id: 1, Parts: ['a', 'b', 'c'] }]);

  const splitIndex = await interpreter.execute("Events | project Id, Part = split(Path, '/', 1)");
  assert.deepEqual(splitIndex.rows, [{ Id: 1, Part: 'b' }]);

  const strcatResult = await interpreter.execute("Events | project Id, Combined = strcat('prefix-', Path, '-suffix')");
  assert.deepEqual(strcatResult.rows, [{ Id: 1, Combined: 'prefix-a/b/c-suffix' }]);

  const indexofResult = await interpreter.execute("Events | project Id, Idx = indexof(Path, '/')");
  assert.deepEqual(indexofResult.rows, [{ Id: 1, Idx: 1 }]);
});

test('interprets parse_json function', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Payload: '{"Type":"Flood","Severity":"High"}' },
    { Id: 2, Payload: '{"Type":"Hail","Severity":"Low"}' },
  ]);

  const result = await interpreter.execute('Events | extend Parsed = parse_json(Payload) | project Id, EventType = tostring(Parsed.Type), Severity = tostring(Parsed.Severity) | sort by Id asc');

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [
    { Id: 1, EventType: 'Flood', Severity: 'High' },
    { Id: 2, EventType: 'Hail', Severity: 'Low' },
  ]);
});

test('interprets trim, extract, and replace_string functions', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Text: '  hello  ', Email: 'user@example.com' },
  ]);

  const trimResult = await interpreter.execute("Events | project Id, Trimmed = trim(' +', Text)");
  assert.deepEqual(trimResult.rows, [{ Id: 1, Trimmed: 'hello' }]);

  const trimStartResult = await interpreter.execute("Events | project Id, Trimmed = trim_start(' +', Text)");
  assert.deepEqual(trimStartResult.rows, [{ Id: 1, Trimmed: 'hello  ' }]);

  const trimEndResult = await interpreter.execute("Events | project Id, Trimmed = trim_end(' +', Text)");
  assert.deepEqual(trimEndResult.rows, [{ Id: 1, Trimmed: '  hello' }]);

  const extractResult = await interpreter.execute("Events | project Id, User = extract('([^@]+)@', 1, Email)");
  assert.deepEqual(extractResult.rows, [{ Id: 1, User: 'user' }]);

  const replaceResult = await interpreter.execute("Events | project Id, NewEmail = replace_string(Email, 'example', 'test')");
  assert.deepEqual(replaceResult.rows, [{ Id: 1, NewEmail: 'user@test.com' }]);
});

test('interprets tostring, isempty, isnotempty, isnull, isnotnull, coalesce functions', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 42, Name: null as unknown as string },
    { Id: 2, Value: null as unknown as number, Name: 'hello' },
    { Id: 3, Value: 7, Name: '' },
  ]);

  const tostringResult = await interpreter.execute('Events | project Id, Str = tostring(Value) | sort by Id asc');
  assert.deepEqual(tostringResult.rows, [{ Id: 1, Str: '42' }, { Id: 2, Str: '' }, { Id: 3, Str: '7' }]);

  const isemptyResult = await interpreter.execute('Events | where isempty(Name) | project Id | sort by Id asc');
  assert.deepEqual(isemptyResult.rows, [{ Id: 1 }, { Id: 3 }]);

  const isnotemptyResult = await interpreter.execute('Events | where isnotempty(Name) | project Id');
  assert.deepEqual(isnotemptyResult.rows, [{ Id: 2 }]);

  const isnullEmptyStringResult = await interpreter.execute("print Result = isnull('')");
  assert.deepEqual(isnullEmptyStringResult.rows, [{ Result: false }]);

  const isnotnullEmptyStringResult = await interpreter.execute("print Result = isnotnull('')");
  assert.deepEqual(isnotnullEmptyStringResult.rows, [{ Result: true }]);

  const isemptyEmptyStringResult = await interpreter.execute("print Result = isempty('')");
  assert.deepEqual(isemptyEmptyStringResult.rows, [{ Result: true }]);

  const coalesceResult = await interpreter.execute("Events | project Id, Result = coalesce(Name, 'default') | sort by Id asc");
  assert.deepEqual(coalesceResult.rows, [
    { Id: 1, Result: 'default' },
    { Id: 2, Result: 'hello' },
    { Id: 3, Result: 'default' },
  ]);
});

test('honors queryParameters on a single-statement query', async () => {
  const interpreter = new KustoInterpreter();
  await seedTable(interpreter, 'Events', [
    { Id: 1, Value: 10 },
    { Id: 2, Value: 20 },
    { Id: 3, Value: 30 },
  ]);

  const result = await interpreter.execute('Events | where Value >= threshold | project Id', {
    queryParameters: { threshold: 20 },
  });

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Id: 2 }, { Id: 3 }]);
});

test('honors queryParameters on a single-statement print expression', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute('print Greeting = strcat("hello, ", who)', {
    queryParameters: { who: 'world' },
  });

  assert.equal(result.kind, 'query');
  assert.deepEqual(result.rows, [{ Greeting: 'hello, world' }]);
});

test('string equality does not numeric-coerce', async () => {
  const interpreter = new KustoInterpreter();

  const leadingZero = await interpreter.execute("print Result = '01' == '1'");
  assert.deepEqual(leadingZero.rows, [{ Result: false }]);

  const decimal = await interpreter.execute("print Result = '1.0' == '1'");
  assert.deepEqual(decimal.rows, [{ Result: false }]);

  const emptyVsZero = await interpreter.execute("print Result = '' == 0");
  assert.deepEqual(emptyVsZero.rows, [{ Result: false }]);

  const exactMatch = await interpreter.execute("print Result = 'WA' == 'WA'");
  assert.deepEqual(exactMatch.rows, [{ Result: true }]);

  const numericMatch = await interpreter.execute('print Result = 1 == 1');
  assert.deepEqual(numericMatch.rows, [{ Result: true }]);
});

test('rejects ordered comparison between two strings', async () => {
  const interpreter = new KustoInterpreter();

  await assert.rejects(
    () => interpreter.execute("print Result = '01' < '1'"),
    /Cannot compare values of types string and string/,
  );
});

test('allows ordered comparison between datetime literals', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute('print Result = datetime(2024-01-01) < datetime(2024-01-02)');
  assert.deepEqual(result.rows, [{ Result: true }]);
});

test('allows ordered comparison after explicit toint cast', async () => {
  const interpreter = new KustoInterpreter();

  const result = await interpreter.execute("print Result = toint('01') < toint('1')");
  assert.deepEqual(result.rows, [{ Result: false }]);
});