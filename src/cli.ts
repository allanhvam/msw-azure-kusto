#!/usr/bin/env node

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { z } from 'zod';
import { DEFAULT_DATABASE_NAME } from './constants.js';
import { KustoInterpreter } from './interpreter/index.js';
import { renderDashboardPage } from './dashboard/ui.js';
import { queryRequestSchema, managementRequestSchema, stringifyResponseWithRealFormatting, toQueryParameters, toQueryV1Response, toQueryV2Response } from './handlers/index.js';

type CliOptions = {
  port: number;
  dashboardPort?: number;
};

const dashboardQuerySchema = z.object({
  csl: z.string().min(1),
  db: z.string().optional(),
  properties: z.unknown().optional(),
});

function parseCliArgs(argv: string[]): CliOptions {
  let port = 3000;
  let dashboardPort: number | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--port' || arg === '-p') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --port.');
      }

      port = parsePort(value, '--port');
      index += 1;
      continue;
    }

    if (arg === '--dashboard') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --dashboard.');
      }

      dashboardPort = parsePort(value, '--dashboard');
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    port,
    dashboardPort,
  };
}

function parsePort(value: string, flagName: string): number {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid value for ${flagName}: ${value}`);
  }

  return port;
}

function printHelp(): void {
  console.log([
    'msw-azure-kusto',
    '',
    'Usage:',
    '  npx msw-azure-kusto --port <port> [--dashboard <port>]',
    '',
    'Options:',
    '  --port, -p       Kusto emulator HTTP port (default: 3000)',
    '  --dashboard      Optional dashboard HTTP port',
    '  --help, -h       Show this help',
  ].join('\n'));
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}

function logInput(endpoint: string, payload: unknown): void {
  console.log(`[msw-azure-kusto][${endpoint}] input ${safeStringify(payload)}`);
}

function logOutput(endpoint: string, payload: unknown): void {
  console.log(`[msw-azure-kusto][${endpoint}] output ${safeStringify(payload)}`);
}

function logErrorOutput(endpoint: string, message: string): void {
  logOutput(endpoint, {
    error: {
      code: 'BadRequest',
      message,
    },
  });
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));

  const interpreters = new Map<string, KustoInterpreter>();
  const getInterpreter = (databaseName?: string): KustoInterpreter => {
    const normalizedDatabase = (databaseName ?? '').trim() || DEFAULT_DATABASE_NAME;
    const existing = interpreters.get(normalizedDatabase);
    if (existing) {
      return existing;
    }

    const interpreter = new KustoInterpreter({ databaseName: normalizedDatabase });
    interpreters.set(normalizedDatabase, interpreter);
    return interpreter;
  };

  const app = new Hono();

  app.get('/v1/rest/auth/metadata', (c) => c.json({}, 404));

  app.post('/v1/rest/mgmt', async (c) => {
    const body = await c.req.json().catch(() => null);
    logInput('/v1/rest/mgmt', body);
    const parsed = managementRequestSchema.safeParse(body);

    if (!parsed.success) {
      logErrorOutput('/v1/rest/mgmt', 'Expected JSON body with non-empty "csl" field.');
      return c.json(
        {
          error: {
            code: 'BadRequest',
            message: 'Expected JSON body with non-empty "csl" field.',
          },
        },
        400,
      );
    }

    try {
      const result = await getInterpreter(parsed.data.db).execute(parsed.data.csl, {
        queryParameters: toQueryParameters(parsed.data.properties),
      });
      const response = toQueryV1Response(result);
      logOutput('/v1/rest/mgmt', response);

      return new Response(stringifyResponseWithRealFormatting(response), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logErrorOutput('/v1/rest/mgmt', error instanceof Error ? error.message : 'Management command failed.');
      return c.json(
        {
          error: {
            code: 'BadRequest',
            message: error instanceof Error ? error.message : 'Management command failed.',
          },
        },
        400,
      );
    }
  });

  app.post('/v1/rest/query', async (c) => {
    const body = await c.req.json().catch(() => null);
    logInput('/v1/rest/query', body);
    const parsed = queryRequestSchema.safeParse(body);

    if (!parsed.success) {
      logErrorOutput('/v1/rest/query', 'Expected JSON body with non-empty "csl" field.');
      return c.json(
        {
          error: {
            code: 'BadRequest',
            message: 'Expected JSON body with non-empty "csl" field.',
          },
        },
        400,
      );
    }

    try {
      const result = await getInterpreter(parsed.data.db).execute(parsed.data.csl, {
        queryParameters: toQueryParameters(parsed.data.properties),
      });
      const response = toQueryV1Response(result);
      logOutput('/v1/rest/query', response);

      return new Response(stringifyResponseWithRealFormatting(response), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logErrorOutput('/v1/rest/query', error instanceof Error ? error.message : 'Query execution failed.');
      return c.json(
        {
          error: {
            code: 'BadRequest',
            message: error instanceof Error ? error.message : 'Query execution failed.',
          },
        },
        400,
      );
    }
  });

  app.post('/v2/rest/query', async (c) => {
    const body = await c.req.json().catch(() => null);
    logInput('/v2/rest/query', body);
    const parsed = queryRequestSchema.safeParse(body);

    if (!parsed.success) {
      logErrorOutput('/v2/rest/query', 'Expected JSON body with non-empty "csl" field.');
      return c.json(
        {
          error: {
            code: 'BadRequest',
            message: 'Expected JSON body with non-empty "csl" field.',
          },
        },
        400,
      );
    }

    try {
      const result = await getInterpreter(parsed.data.db).execute(parsed.data.csl, {
        queryParameters: toQueryParameters(parsed.data.properties),
      });
      const response = toQueryV2Response(result);
      logOutput('/v2/rest/query', response);

      return new Response(stringifyResponseWithRealFormatting(response), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logErrorOutput('/v2/rest/query', error instanceof Error ? error.message : 'Query execution failed.');
      return c.json(
        {
          error: {
            code: 'BadRequest',
            message: error instanceof Error ? error.message : 'Query execution failed.',
          },
        },
        400,
      );
    }
  });

  const apiServer = serve({ fetch: app.fetch, port: options.port });
  console.log(`Kusto emulator listening on http://localhost:${options.port}`);

  let dashboardServer: ReturnType<typeof serve> | null = null;
  if (options.dashboardPort !== undefined) {
    const dashboardApp = new Hono();

    dashboardApp.get('/', (c) => {
      return c.html(renderDashboardPage());
    });

    dashboardApp.post('/api/query', async (c) => {
      const body = await c.req.json().catch(() => null);
      logInput('/api/query', body);
      const parsed = dashboardQuerySchema.safeParse(body);

      if (!parsed.success) {
        logErrorOutput('/api/query', 'Expected JSON body with non-empty "csl" field.');
        return c.json(
          {
            error: {
              code: 'BadRequest',
              message: 'Expected JSON body with non-empty "csl" field.',
            },
          },
          400,
        );
      }

      try {
        const result = await getInterpreter(parsed.data.db).execute(parsed.data.csl, {
          queryParameters: toQueryParameters(parsed.data.properties),
        });
        const response = {
          kind: result.kind,
          columns: result.rows[0] ? Object.keys(result.rows[0]) : [],
          rows: result.rows,
          rowCount: result.rows.length,
        };
        logOutput('/api/query', response);

        return c.json(response);
      } catch (error) {
        logErrorOutput('/api/query', error instanceof Error ? error.message : 'Query execution failed.');
        return c.json(
          {
            error: {
              code: 'BadRequest',
              message: error instanceof Error ? error.message : 'Query execution failed.',
            },
          },
          400,
        );
      }
    });

    dashboardServer = serve({ fetch: dashboardApp.fetch, port: options.dashboardPort });
    console.log(`Dashboard listening on http://localhost:${options.dashboardPort}`);
  }

  const stopServers = (): void => {
    dashboardServer?.close();
    apiServer.close();
    process.exit(0);
  };

  process.on('SIGINT', stopServers);
  process.on('SIGTERM', stopServers);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`msw-azure-kusto failed to start: ${message}`);
  process.exit(1);
});
