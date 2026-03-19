import { z } from 'zod';

export const queryRequestSchema = z.object({
  csl: z.string().min(1),
  db: z.string().optional(),
  properties: z.unknown().optional(),
});

export const managementRequestSchema = z.object({
  csl: z.string().min(1),
  db: z.string().optional(),
  properties: z.unknown().optional(),
});

export function toQueryParameters(properties: unknown): Record<string, unknown> | undefined {
  if (properties === null || properties === undefined) {
    return undefined;
  }

  let parsedProperties: unknown = properties;
  if (typeof parsedProperties === 'string') {
    try {
      parsedProperties = JSON.parse(parsedProperties) as unknown;
    } catch {
      return undefined;
    }
  }

  if (typeof parsedProperties !== 'object' || parsedProperties === null) {
    return undefined;
  }

  const maybeParameters = (parsedProperties as { Parameters?: unknown }).Parameters;
  if (typeof maybeParameters !== 'object' || maybeParameters === null || Array.isArray(maybeParameters)) {
    return undefined;
  }

  return maybeParameters as Record<string, unknown>;
}
