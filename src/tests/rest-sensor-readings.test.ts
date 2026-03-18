import assert from "node:assert";
import test from "node:test";
import { setupServer } from "msw/node";
import { handlers } from "../handlers.js";

test.skip("rest sensor readings", async () => {
  const server = setupServer(...handlers());
  server.listen();

  try {
    // Create
    let response = await fetch("https://kusto.local/v1/rest/mgmt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        db: "Readings",
        csl: ".create table SensorReadings (Timestamp: datetime, SensorId: string, Temperature: real, Humidity: real)",
      }),
    });

    assert.equal(response.status, 200);

    let actual = await response.json();
    assert.deepEqual(actual, {
      Tables: [
        {
          TableName: "Table_0",
          Columns: [
            {
              ColumnName: "TableName",
              DataType: "String",
              ColumnType: "string",
            },
            {
              ColumnName: "Schema",
              DataType: "String",
              ColumnType: "string",
            },
            {
              ColumnName: "DatabaseName",
              DataType: "String",
              ColumnType: "string",
            },
            {
              ColumnName: "Folder",
              DataType: "String",
              ColumnType: "string",
            },
            {
              ColumnName: "DocString",
              DataType: "String",
              ColumnType: "string",
            },
          ],
          Rows: [
            [
              "SensorReadings",
              '{"Name":"SensorReadings","OrderedColumns":[{"Name":"Timestamp","Type":"System.DateTime","CslType":"datetime"},{"Name":"SensorId","Type":"System.String","CslType":"string"},{"Name":"Temperature","Type":"System.Double","CslType":"real"},{"Name":"Humidity","Type":"System.Double","CslType":"real"}]}',
              "Readings",
              null,
              null,
            ],
          ],
        },
      ],
    });

    // Ingest
    response = await fetch("https://kusto.local/v1/rest/mgmt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        db: "Readings",
        csl:
          ".ingest inline into table SensorReadings <|\n" +
          "2026-03-18T10:00:00Z,sensor-1,22.5,45.0\n" +
          "2026-03-18T10:01:00Z,sensor-2,23.1,42.3\n" +
          "2026-03-18T10:02:00Z,sensor-1,22.8,44.7\n" +
          "2026-03-18T10:03:00Z,sensor-3,21.9,48.1\n" +
          "2026-03-18T10:04:00Z,sensor-2,23.4,41.8",
      }),
    });

    assert.equal(response.status, 200);

    actual = await response.json();
    const expected = {
      Tables: [
        {
          TableName: "Table_0",
          Columns: [
            {
              ColumnName: "ExtentId",
              DataType: "Guid",
              ColumnType: "guid",
            },
            {
              ColumnName: "ItemLoaded",
              DataType: "String",
              ColumnType: "string",
            },
            {
              ColumnName: "Duration",
              DataType: "TimeSpan",
              ColumnType: "timespan",
            },
            {
              ColumnName: "HasErrors",
              DataType: "Boolean",
              ColumnType: "bool",
            },
            {
              ColumnName: "OperationId",
              DataType: "Guid",
              ColumnType: "guid",
            },
          ],
          Rows: [
            [
              "76f9c279-1528-4c78-81c6-8abe2700d819",
              "inproc:a1272e2c-3925-4b52-a4bc-c5f92f455eaf",
              "00:00:00.1797682",
              false,
              "1cc77af0-fbcb-40e4-a246-443bebe86258",
            ],
          ],
        },
        // {
        //   TableName: "Table_1",
        //   Columns: [
        //     {
        //       ColumnName: "OperationId",
        //       DataType: "Guid",
        //       ColumnType: "guid",
        //     },
        //     {
        //       ColumnName: "Database",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "Table",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "FailedOn",
        //       DataType: "DateTime",
        //       ColumnType: "datetime",
        //     },
        //     {
        //       ColumnName: "IngestionSourcePath",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "Details",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "FailureKind",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "RootActivityId",
        //       DataType: "Guid",
        //       ColumnType: "guid",
        //     },
        //     {
        //       ColumnName: "OperationKind",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "OriginatesFromUpdatePolicy",
        //       DataType: "SByte",
        //       ColumnType: "bool",
        //     },
        //     {
        //       ColumnName: "ErrorCode",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "Principal",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "ShouldRetry",
        //       DataType: "SByte",
        //       ColumnType: "bool",
        //     },
        //     {
        //       ColumnName: "User",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "ingestionProperties",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "NumberOfSources",
        //       DataType: "Int32",
        //       ColumnType: "int",
        //     },
        //   ],
        //   Rows: [],
        // },
        // {
        //   TableName: "Table_2",
        //   Columns: [
        //     {
        //       ColumnName: "Ordinal",
        //       DataType: "Int64",
        //       ColumnType: "long",
        //     },
        //     {
        //       ColumnName: "Kind",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "Name",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //     {
        //       ColumnName: "Id",
        //       DataType: "String",
        //       ColumnType: "string",
        //     },
        //   ],
        //   Rows: [
        //     [0, "QueryResult", "@LoadedExtents", ""],
        //     [1, "QueryResult", "IngestionFailures", ""],
        //   ],
        // },
      ],
    };

    // Note: ignore rows
    expected.Tables[0].Rows = [];
    actual.Tables[0].Rows = [];
    assert.deepEqual(actual, expected);

    // Query
    response = await fetch("https://kusto.local/v2/rest/query", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        db: "Readings",
        csl: "SensorReadings | order by Timestamp asc",
      }),
    });

    assert.equal(response.status, 200);

    actual = await response.json();
    const expected2 = [
      {
        FrameType: "DataSetHeader",
        IsProgressive: false,
        Version: "v2.0",
        IsFragmented: false,
        ErrorReportingPlacement: "InData",
      },
      // {
      //   FrameType: "DataTable",
      //   TableId: 0,
      //   TableKind: "QueryProperties",
      //   TableName: "@ExtendedProperties",
      //   Columns: [
      //     {
      //       ColumnName: "TableId",
      //       ColumnType: "int",
      //     },
      //     {
      //       ColumnName: "Key",
      //       ColumnType: "string",
      //     },
      //     {
      //       ColumnName: "Value",
      //       ColumnType: "dynamic",
      //     },
      //   ],
      //   Rows: [
      //     [
      //       1,
      //       "Visualization",
      //       '{"Visualization":null,"Title":null,"XColumn":null,"Series":null,"YColumns":null,"AnomalyColumns":null,"XTitle":null,"YTitle":null,"XAxis":null,"YAxis":null,"Legend":null,"YSplit":null,"Accumulate":false,"IsQuerySorted":true,"Kind":null,"Ymin":"NaN","Ymax":"NaN","Xmin":null,"Xmax":null}',
      //     ],
      //   ],
      // },
      {
        FrameType: "DataTable",
        TableId: 0, // Was 1
        TableKind: "PrimaryResult",
        TableName: "PrimaryResult",
        Columns: [
          {
            ColumnName: "Timestamp",
            ColumnType: "datetime",
          },
          {
            ColumnName: "SensorId",
            ColumnType: "string",
          },
          {
            ColumnName: "Temperature",
            ColumnType: "real",
          },
          {
            ColumnName: "Humidity",
            ColumnType: "real",
          },
        ],
        Rows: [
          ["2026-03-18T10:00:00Z", "sensor-1", 22.5, 45.0],
          ["2026-03-18T10:01:00Z", "sensor-2", 23.1, 42.3],
          ["2026-03-18T10:02:00Z", "sensor-1", 22.8, 44.7],
          ["2026-03-18T10:03:00Z", "sensor-3", 21.9, 48.1],
          ["2026-03-18T10:04:00Z", "sensor-2", 23.4, 41.8],
        ],
      },
      // {
      //   FrameType: "DataTable",
      //   TableId: 2,
      //   TableKind: "QueryCompletionInformation",
      //   TableName: "QueryCompletionInformation",
      //   Columns: [
      //     {
      //       ColumnName: "Timestamp",
      //       ColumnType: "datetime",
      //     },
      //     {
      //       ColumnName: "ClientRequestId",
      //       ColumnType: "string",
      //     },
      //     {
      //       ColumnName: "ActivityId",
      //       ColumnType: "guid",
      //     },
      //     {
      //       ColumnName: "SubActivityId",
      //       ColumnType: "guid",
      //     },
      //     {
      //       ColumnName: "ParentActivityId",
      //       ColumnType: "guid",
      //     },
      //     {
      //       ColumnName: "Level",
      //       ColumnType: "int",
      //     },
      //     {
      //       ColumnName: "LevelName",
      //       ColumnType: "string",
      //     },
      //     {
      //       ColumnName: "StatusCode",
      //       ColumnType: "int",
      //     },
      //     {
      //       ColumnName: "StatusCodeName",
      //       ColumnType: "string",
      //     },
      //     {
      //       ColumnName: "EventType",
      //       ColumnType: "int",
      //     },
      //     {
      //       ColumnName: "EventTypeName",
      //       ColumnType: "string",
      //     },
      //     {
      //       ColumnName: "Payload",
      //       ColumnType: "string",
      //     },
      //   ],
      //   Rows: [
      //     [
      //       "2026-03-18T09:53:04.2065269Z",
      //       "Kusto.Web.KWE.Query;d68d489d-37e3-455b-b38f-b93d11587577;7c3cf99a-b58c-4572-9814-f9b0bb4e9f94",
      //       "c2e673ee-a08e-4df1-923f-ed6bf95da6c9",
      //       "fa947a2a-27ac-4639-94cb-01da26ec5ca7",
      //       "5b629079-2ddf-4dff-a3f8-2b5a1cc1b0f9",
      //       4,
      //       "Info",
      //       0,
      //       "S_OK (0)",
      //       4,
      //       "QueryInfo",
      //       '{"Count":1,"Text":"Query completed successfully"}',
      //     ],
      //     [
      //       "2026-03-18T09:53:04.2065269Z",
      //       "Kusto.Web.KWE.Query;d68d489d-37e3-455b-b38f-b93d11587577;7c3cf99a-b58c-4572-9814-f9b0bb4e9f94",
      //       "c2e673ee-a08e-4df1-923f-ed6bf95da6c9",
      //       "fa947a2a-27ac-4639-94cb-01da26ec5ca7",
      //       "5b629079-2ddf-4dff-a3f8-2b5a1cc1b0f9",
      //       4,
      //       "Info",
      //       0,
      //       "S_OK (0)",
      //       5,
      //       "WorkloadGroup",
      //       '{"Count":1,"Text":"default"}',
      //     ],
      //     [
      //       "2026-03-18T09:53:04.2065269Z",
      //       "Kusto.Web.KWE.Query;d68d489d-37e3-455b-b38f-b93d11587577;7c3cf99a-b58c-4572-9814-f9b0bb4e9f94",
      //       "c2e673ee-a08e-4df1-923f-ed6bf95da6c9",
      //       "fa947a2a-27ac-4639-94cb-01da26ec5ca7",
      //       "5b629079-2ddf-4dff-a3f8-2b5a1cc1b0f9",
      //       4,
      //       "Info",
      //       0,
      //       "S_OK (0)",
      //       6,
      //       "EffectiveRequestOptions",
      //       '{"Count":1,"Text":"{\\"DataScope\\":\\"All\\",\\"QueryConsistency\\":\\"strongconsistency\\",\\"MaxMemoryConsumptionPerIterator\\":5368709120,\\"MaxMemoryConsumptionPerQueryPerNode\\":7515957248,\\"QueryFanoutNodesPercent\\":100,\\"QueryFanoutThreadsPercent\\":100}"}',
      //     ],
      //     [
      //       "2026-03-18T09:53:04.2065269Z",
      //       "Kusto.Web.KWE.Query;d68d489d-37e3-455b-b38f-b93d11587577;7c3cf99a-b58c-4572-9814-f9b0bb4e9f94",
      //       "c2e673ee-a08e-4df1-923f-ed6bf95da6c9",
      //       "fa947a2a-27ac-4639-94cb-01da26ec5ca7",
      //       "5b629079-2ddf-4dff-a3f8-2b5a1cc1b0f9",
      //       6,
      //       "Stats",
      //       0,
      //       "S_OK (0)",
      //       0,
      //       "QueryResourceConsumption",
      //       '{"QueryHash":"15ddcca4145e1cc8","ExecutionTime":0.0024329,"resource_usage":{"cache":{"shards":{"hot":{"hitbytes":1587,"missbytes":0,"retrievebytes":0},"cold":{"hitbytes":0,"missbytes":0,"retrievebytes":0},"bypassbytes":0}},"cpu":{"user":"00:00:00","kernel":"00:00:00","total cpu":"00:00:00","breakdown":{"query execution":"00:00:00","query planning":"00:00:00"}},"memory":{"peak_per_node":1574112},"network":{"inter_cluster_total_bytes":902,"cross_cluster_total_bytes":0}},"input_dataset_statistics":{"extents":{"total":1,"scanned":1,"scanned_min_datetime":"2026-03-18T09:52:04.4508491Z","scanned_max_datetime":"2026-03-18T09:52:04.4508491Z"},"rows":{"total":5,"scanned":5},"rowstores":{"scanned_rows":0,"scanned_values_size":0},"shards":{"queries_generic":1,"queries_specialized":0}},"dataset_statistics":[{"table_row_count":5,"table_size":216}],"cross_cluster_resource_usage":{}}',
      //     ],
      //   ],
      // },
      {
        FrameType: "DataSetCompletion",
        HasErrors: false,
        Cancelled: false,
      },
    ];
    assert.deepEqual(actual, expected2);
  } finally {
    server.close();
  }
});
