import assert from 'node:assert';
import test from 'node:test';

import { setupServer } from 'msw/node';

import { handlers } from '../handlers.js';

test('kusto handler returns query results', async () => {
  const server = setupServer(...handlers());
  server.listen();

  try {
    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: '.create table Events (Id:int, Value:int)' }),
    });

    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: '.ingest inline into table Events <| 1,10\n2,20' }),
    });

    const response = await fetch('https://kusto.local/v2/rest/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: 'Events | take 1' }),
    });

    assert.equal(response.status, 200);

    const json = await response.json() as Array<{
      FrameType: string;
      TableKind?: string;
      Rows?: unknown[][];
    }>;

    const primaryDataTable = json.find((frame) => frame.FrameType === 'DataTable' && frame.TableKind === 'PrimaryResult');
    assert.ok(primaryDataTable);
    assert.deepEqual(primaryDataTable.Rows, [[1, 10]]);
  } finally {
    server.close();
  }
});

test('kusto handler validates query payload', async () => {
  const server = setupServer(...handlers());
  server.listen();

  try {
    const response = await fetch('https://kusto.local/v2/rest/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'Events | take 1' }),
    });

    assert.equal(response.status, 400);
  } finally {
    server.close();
  }
});

test('management endpoint executes ingest command', async () => {
  const server = setupServer(...handlers());
  server.listen();

  try {
    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: '.create table Events (Id:int, Value:int)' }),
    });

    const ingestResponse = await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: '.ingest inline into table Events <| 1,10' }),
    });

    assert.equal(ingestResponse.status, 200);

    const queryResponse = await fetch('https://kusto.local/v2/rest/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: 'Events | project Id, Value' }),
    });

    const queryJson = await queryResponse.json() as Array<{
      FrameType: string;
      TableKind?: string;
      Rows?: unknown[][];
    }>;

    const primaryDataTable = queryJson.find((frame) => frame.FrameType === 'DataTable' && frame.TableKind === 'PrimaryResult');
    assert.ok(primaryDataTable);
    assert.deepEqual(primaryDataTable.Rows, [[1, 10]]);
  } finally {
    server.close();
  }
});

test('kusto handler returns dynamic values as objects', async () => {
  const server = setupServer(...handlers());
  server.listen();

  try {
    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: '.create table Events (Id:int, Payload:dynamic)' }),
    });

    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: '.ingest inline into table Events <| [1,{"foo":"bar"}]' }),
    });

    const response = await fetch('https://kusto.local/v2/rest/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ csl: 'Events | project Id, Payload' }),
    });

    assert.equal(response.status, 200);

    const json = await response.json() as Array<{
      FrameType: string;
      TableKind?: string;
      Columns?: Array<{ ColumnName: string; DataType: string; ColumnType: string }>;
      Rows?: unknown[][];
    }>;

    const primaryDataTable = json.find((frame) => frame.FrameType === 'DataTable' && frame.TableKind === 'PrimaryResult');
    assert.ok(primaryDataTable);
    assert.deepEqual(primaryDataTable.Columns, [
      { ColumnName: 'Id', ColumnType: 'int' },
      { ColumnName: 'Payload', ColumnType: 'dynamic' },
    ]);
    assert.deepEqual(primaryDataTable.Rows, [[1, { foo: 'bar' }]]);
  } finally {
    server.close();
  }
});

test('kusto handler isolates data per database', async () => {
  const server = setupServer(...handlers());
  server.listen();

  try {
    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ db: 'DbA', csl: '.create table Events (Id:int, Value:int)' }),
    });
    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ db: 'DbB', csl: '.create table Events (Id:int, Value:int)' }),
    });

    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ db: 'DbA', csl: '.ingest inline into table Events <| 1,100' }),
    });
    await fetch('https://kusto.local/v1/rest/mgmt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ db: 'DbB', csl: '.ingest inline into table Events <| 2,200' }),
    });

    const queryDbA = await fetch('https://kusto.local/v2/rest/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ db: 'DbA', csl: 'Events | sort by Id asc | project Id, Value' }),
    });
    const queryDbB = await fetch('https://kusto.local/v2/rest/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ db: 'DbB', csl: 'Events | sort by Id asc | project Id, Value' }),
    });

    assert.equal(queryDbA.status, 200);
    assert.equal(queryDbB.status, 200);

    const jsonDbA = await queryDbA.json() as Array<{
      FrameType: string;
      TableKind?: string;
      Rows?: unknown[][];
    }>;
    const jsonDbB = await queryDbB.json() as Array<{
      FrameType: string;
      TableKind?: string;
      Rows?: unknown[][];
    }>;

    const primaryDbA = jsonDbA.find((frame) => frame.FrameType === 'DataTable' && frame.TableKind === 'PrimaryResult');
    const primaryDbB = jsonDbB.find((frame) => frame.FrameType === 'DataTable' && frame.TableKind === 'PrimaryResult');
    assert.ok(primaryDbA);
    assert.ok(primaryDbB);
    assert.deepEqual(primaryDbA.Rows, [[1, 100]]);
    assert.deepEqual(primaryDbB.Rows, [[2, 200]]);
  } finally {
    server.close();
  }
});