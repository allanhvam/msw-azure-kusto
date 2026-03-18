import { http, HttpResponse } from 'msw';
import { KustoInterpreter } from './interpreter/index.js';
import { DEFAULT_DATABASE_NAME } from './constants.js';
import { queryRequestSchema, managementRequestSchema, toQueryParameters, toQueryV1Response, toQueryV2Response } from './handlers/index.js';

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
        result: await getInterpreter(parsed.data.db).execute(parsed.data.csl, {
          queryParameters: toQueryParameters(parsed.data.properties),
        }),
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
      const result = await interpreter.execute(parsed.data.csl, {
        queryParameters: toQueryParameters(parsed.data.properties),
      });

      return HttpResponse.json(toQueryV1Response(result));
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : 'Management command failed.');
    }
  });

  if (process.env.PORTLESS_URL) {
    import('./dashboard/dashboard.js').then((pkg) => {
      pkg.dashboard({
        executeQuery: async (input) => {
          return await getInterpreter(input.db).execute(input.csl, {
            queryParameters: toQueryParameters(input.properties),
          });
        },
      });
    });
  }

  return [
    authMetadataHandler,
    queryHandler,
    queryV1Handler,
    managementHandler,
  ];
}