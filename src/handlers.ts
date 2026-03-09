import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { KustoInterpreter, type KustoExecutionResult, type KustoRow } from './interpreter/index.js';
import { DEFAULT_DATABASE_NAME } from './constants.js';

const queryRequestSchema = z.object({
  csl: z.string().min(1),
  db: z.string().optional(),
  properties: z.unknown().optional(),
});

const managementRequestSchema = z.object({
  csl: z.string().min(1),
  db: z.string().optional(),
  properties: z.unknown().optional(),
});

const acceptedDomains = ['*.kusto.windows.net', 'kusto.local'];
const wildcardPrefix = '*.';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function domainToPattern(domain: string): string {
  if (domain.startsWith(wildcardPrefix)) {
    const suffix = escapeRegex(domain.slice(wildcardPrefix.length));
    return `(?:[a-z0-9-]+\\.)+${suffix}`;
  }

  return escapeRegex(domain);
}

function buildKustoUrlMatcher(path: string): RegExp {
  const domainsPattern = acceptedDomains.map(domainToPattern).join('|');
  const escapedPath = escapeRegex(path);

  return new RegExp(`^https://(?:${domainsPattern})${escapedPath}(?:\\?.*)?$`, 'i');
}

function typeForValue(value: unknown): string {
  if (value instanceof Date) {
    return 'datetime';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'real';
  }

  if (typeof value === 'boolean') {
    return 'bool';
  }

  if (value === null || value === undefined) {
    return 'string';
  }

  if (Array.isArray(value)) {
    return 'dynamic';
  }

  if (typeof value === 'object') {
    return 'dynamic';
  }

  return 'string';
}

function toKustoTable(name: string, rows: KustoRow[]): {
  TableName: string;
  Columns: Array<{ ColumnName: string; DataType: string; ColumnType: string }>;
  Rows: unknown[][];
} {
  const columnNames = rows.length > 0
    ? Object.keys(rows[0])
    : [];

  const columns = columnNames.map((columnName) => {
    const firstValue = rows.find((row) => row[columnName] !== undefined)?.[columnName];
    const dataType = typeForValue(firstValue);

    return {
      ColumnName: columnName,
      DataType: dataType,
      ColumnType: dataType,
    };
  });

  const serializedRows = rows.map((row) => columnNames.map((columnName) => row[columnName]));

  return {
    TableName: name,
    Columns: columns,
    Rows: serializedRows,
  };
}

function toQueryV1Response(result: KustoExecutionResult): { Tables: Array<ReturnType<typeof toKustoTable>> } {
  return {
    Tables: [toKustoTable('Table_0', result.rows)],
  };
}

function toQueryV2Response(result: KustoExecutionResult): Array<
  | { FrameType: 'DataSetHeader'; IsProgressive: false; Version: 'v2.0' }
  | ({ FrameType: 'DataTable'; TableId: number; TableKind: 'PrimaryResult' } & ReturnType<typeof toKustoTable>)
  | { FrameType: 'DataSetCompletion'; HasErrors: false; Cancelled: false }
> {
  return [
    {
      FrameType: 'DataSetHeader',
      IsProgressive: false,
      Version: 'v2.0',
    },
    {
      FrameType: 'DataTable',
      TableId: 0,
      TableKind: 'PrimaryResult',
      ...toKustoTable('Table_0', result.rows),
    },
    {
      FrameType: 'DataSetCompletion',
      HasErrors: false,
      Cancelled: false,
    },
  ];
}

function badRequest(message: string) {
  return HttpResponse.json(
    {
      error: {
        code: 'BadRequest',
        message,
      },
    },
    { status: 400 },
  );
}

export function handlers(): Array<ReturnType<typeof http.get> | ReturnType<typeof http.post>> {
  const interpreters = new Map<string, KustoInterpreter>();

  const getInterpreter = (databaseName?: string): KustoInterpreter => {
    databaseName = (databaseName ?? '').trim() || DEFAULT_DATABASE_NAME;
    const existing = interpreters.get(databaseName);
    if (existing) {
      return existing;
    }

    const interpreter = new KustoInterpreter({
      databaseName,
    });
    interpreters.set(databaseName, interpreter);
    return interpreter;
  };

  const authMetadataHandler = http.get(buildKustoUrlMatcher('/v1/rest/auth/metadata'), () => HttpResponse.json({}, { status: 404 }));

  const executeQuery = async (request: Request) => {
    const body = await request.json().catch(() => null);
    const parsed = queryRequestSchema.safeParse(body);

    if (!parsed.success) {
      return {
        errorResponse: badRequest('Expected JSON body with non-empty "csl" field.'),
      };
    }

    try {
      return {
        result: await getInterpreter(parsed.data.db).execute(parsed.data.csl),
      };
    } catch (error) {
      return {
        errorResponse: badRequest(error instanceof Error ? error.message : 'Query execution failed.'),
      };
    }
  };

  const queryHandler = http.post(buildKustoUrlMatcher('/v2/rest/query'), async ({ request }) => {
    const execution = await executeQuery(request);
    if (execution.errorResponse) {
      return execution.errorResponse;
    }

    return HttpResponse.json(toQueryV2Response(execution.result));
  });

  const queryV1Handler = http.post(buildKustoUrlMatcher('/v1/rest/query'), async ({ request }) => {
    const execution = await executeQuery(request);
    if (execution.errorResponse) {
      return execution.errorResponse;
    }

    return HttpResponse.json(toQueryV1Response(execution.result));
  });

  const managementHandler = http.post(buildKustoUrlMatcher('/v1/rest/mgmt'), async ({ request }) => {
    const body = await request.json().catch(() => null);
    const parsed = managementRequestSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest('Expected JSON body with non-empty "csl" field.');
    }

    try {
      const interpreter = getInterpreter(parsed.data.db);
      const result = await interpreter.execute(parsed.data.csl);

      return HttpResponse.json(toQueryV1Response(result));
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : 'Management command failed.');
    }
  });

  return [
    authMetadataHandler,
    queryHandler,
    queryV1Handler,
    managementHandler,
  ];
}