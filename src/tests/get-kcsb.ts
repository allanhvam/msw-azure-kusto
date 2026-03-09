import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { KustoConnectionStringBuilder } from 'azure-kusto-data';
import { setupServer } from 'msw/node';
import { handlers } from '../handlers.js';

const execFileAsync = promisify(execFile);

export type KcsbContext = {
  kcsb: KustoConnectionStringBuilder;
  close?: () => void;
};

async function getAzureCliAccessToken(resource: string): Promise<string> {
  const { stdout } = await execFileAsync('az', [
    'account',
    'get-access-token',
    '--resource',
    resource,
    '--output',
    'json',
  ]);

  const parsed = JSON.parse(stdout) as { accessToken?: unknown };
  if (typeof parsed.accessToken !== 'string' || parsed.accessToken.length === 0) {
    throw new Error('Azure CLI did not return a valid access token.');
  }

  return parsed.accessToken;
}

export function getKcsb(useMock: boolean, cluster = process.env.CLUSTER ?? ""): KcsbContext {
  if (useMock) {
    const server = setupServer(...handlers());
    server.listen();

    return {
      kcsb: KustoConnectionStringBuilder.withTokenProvider(cluster, async () => 'mock-token'),
      close: () => {
        server.close();
      },
    };
  }

  return {
    kcsb: KustoConnectionStringBuilder.withTokenProvider(
      cluster,
      async () => await getAzureCliAccessToken(cluster),
    ),
  };
}
