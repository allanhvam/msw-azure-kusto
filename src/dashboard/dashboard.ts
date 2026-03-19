import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { portmore } from 'portmore';
import { z } from 'zod';
import type { KustoExecutionResult } from '../interpreter/index.js';
import { renderDashboardPage } from './ui.js';

type DashboardExecuteQueryInput = {
  csl: string;
  db?: string;
  properties?: unknown;
};

type DashboardOptions = {
  executeQuery: (input: DashboardExecuteQueryInput) => Promise<KustoExecutionResult>;
};

const dashboardQuerySchema = z.object({
  csl: z.string().min(1),
  db: z.string().optional(),
  properties: z.unknown().optional(),
});

export async function dashboard(options: DashboardOptions): Promise<void> {
  return await portmore({
    name: 'kusto',
    title: 'Kusto',
    icon: '🗄️',
    start: async (port) => {
      const app = new Hono();

      app.get('/', (c) => {
        return c.html(renderDashboardPage());
      });

      app.post('/api/query', async (c) => {
        const body = await c.req.json().catch(() => null);
        const parsed = dashboardQuerySchema.safeParse(body);

        if (!parsed.success) {
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
          const result = await options.executeQuery(parsed.data);

          return c.json({
            kind: result.kind,
            columns: result.rows[0] ? Object.keys(result.rows[0]) : [],
            rows: result.rows,
            rowCount: result.rows.length,
          });
        } catch (error) {
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

      return serve({ fetch: app.fetch, port });
    },
    stop: async (server) => {
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    },
  });
}