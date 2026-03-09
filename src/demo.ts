import { Client, KustoConnectionStringBuilder } from 'azure-kusto-data';
import { DEFAULT_DATABASE_NAME } from './constants.js';
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

const server = setupServer(...handlers());
server.listen({ onUnhandledRequest: 'error' });

const cluster = "https://example.kusto.windows.net";
const kcsb = KustoConnectionStringBuilder.withTokenProvider(cluster, async () => "mock-token");
const client = new Client(kcsb);

try {
  let response = await client.executeQuery("Database", 'print Message = "Demo"');
  let primary = response.primaryResults[0];
  let json = primary?.toJSON();

  console.log(json?.data ?? []);

  // StormEvents
  client.defaultDatabase = DEFAULT_DATABASE_NAME;

  await client.executeMgmt(null, ".create table StormEvents (EventId:int, State:string, Damage:int)");
  await client.executeMgmt(null, ".ingest inline into table StormEvents <| 1,WA,10\n2,CA,20\n3,WA,5");

  response = await client.executeQuery(
    null,
    "StormEvents | where State == 'WA' | project EventId, State",
  );

  primary = response.primaryResults[0];
  json = primary?.toJSON();
  console.log(json.data);

  await client.executeMgmt(null, ".drop table StormEvents");
} finally {
  client.close();
}
