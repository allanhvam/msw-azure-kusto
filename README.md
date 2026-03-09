# msw-azure-kusto

TypeScript Azure Data Explorer (Kusto) HTTP emulator for local testing with MSW.

> Disclaimer: Primarily coded by Codex and Opus, this emulator is not feature complete. Only inline ingestion and URI-based CSV ingestion.

## Usage

1. Install `msw` (https://mswjs.io/docs/getting-started)
2. Install `msw-azure-kusto`
3. Import `handlers` from `msw-azure-kusto` and pass them to your MSW setup

### Install

```bash
npm install msw-azure-kusto
```

### Setup

```ts
import { setupServer } from "msw/node";
import { handlers } from "msw-azure-kusto";

export const server = setupServer(...handlers());
```

### `azure-kusto-data` client example

`msw-azure-kusto` emulates Kusto REST endpoints such as `https://<cluster>/v1/rest/mgmt` and `https://<cluster>/v2/rest/query`.
Use your normal `azure-kusto-data` client setup and point it at a mocked cluster host.

```ts
import { Client, KustoConnectionStringBuilder } from "azure-kusto-data";
import { setupServer } from "msw/node";
import { handlers } from "msw-azure-kusto";

const server = setupServer(...handlers());
server.listen();

const cluster = "https://example.kusto.windows.net";
const kcsb = KustoConnectionStringBuilder.withTokenProvider(cluster, async () => "mock-token");
const client = new Client(kcsb);

await client.executeMgmt("Samples", ".create table StormEvents (EventId:int, State:string, Damage:int)");
await client.executeMgmt("Samples", ".ingest inline into table StormEvents <| 1,WA,10\n2,CA,20\n3,WA,5");

const response = await client.executeQuery(
  "Samples",
  "StormEvents | where State == 'WA' | project EventId, State",
);

const primary = response.primaryResults[0];
const json = primary?.toJSON() as { data: Array<Record<string, unknown>> };
console.log(json.data);

await client.close();
server.close();
```

Supported hosts:

- `https://*.kusto.windows.net`
- `https://kusto.local`

## Snapshot tests

Snapshots are in [src/tests/snapshots/commands.test.snapshot.ts](src/tests/snapshots/commands.test.snapshot.ts), based on `.kql` files in [src/tests/commands](src/tests/commands).

Set `CLUSTER` in your shell or `.env` before running command tests, for example:

```bash
export CLUSTER="https://kusto.local"
```

### Run snapshot-backed command tests

```bash
node --run build
node --env-file-if-exists=.env --test dist/tests/commands.test.js
```

To run only medium guide command cases:

```bash
node --env-file-if-exists=.env --test dist/tests/commands.test.js --test-name-pattern "command - medium-guide"
```

### Update snapshots

```bash
node --run build
node --run test-update-snapshots
```
