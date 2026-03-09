import assert from 'node:assert';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test, { snapshot } from 'node:test';
import type { KustoResponseDataSet } from 'azure-kusto-data';
import { Client, ClientRequestProperties } from 'azure-kusto-data';
import { getKcsb } from './get-kcsb.js';

type Command = {
  name: string;
  queries: string[];
};

const COMMANDS_DIR = join(
  process.cwd(),
  'src',
  'tests',
  'commands',
);

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
const EMPTY_INPROC_GUID = `inproc:${EMPTY_GUID}`;

function serializeForSnapshot(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => serializeForSnapshot(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, itemValue]) => {
      if (key === 'ExtentId' || key === 'OperationId') {
        return [key, EMPTY_GUID] as const;
      }

      if (key === 'ItemLoaded') {
        return [key, EMPTY_INPROC_GUID] as const;
      }

      if (key === 'Duration') {
        return [key, 0] as const;
      }

      if (key === 'LastUpdatedOn') {
        return [key, new Date(Date.UTC(0, 0, 0, 0, 0, 0))] as const;        
      }

      return [key, serializeForSnapshot(itemValue)] as const;
    });

    return Object.fromEntries(entries);
  }

  return value;
}

function isManagementCommand(statement: string): boolean {
  return statement.trimStart().startsWith('.');
}

async function getCommand(command: string): Promise<Command> {
  const entries = await readdir(COMMANDS_DIR, { withFileTypes: true });
  const caseFilePattern = new RegExp(`^${command}(?:-(\\d+))?\\.kql$`);

  const caseFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const match = entry.name.match(caseFilePattern);

      return match
        ? {
            name: entry.name,
            order: match[1] !== undefined ? Number.parseInt(match[1], 10) : Number.NEGATIVE_INFINITY,
          }
        : undefined;
    })
    .filter((entry): entry is { name: string; order: number } => entry !== undefined)
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));

  const queries = await Promise.all(
    caseFiles.map((file) => readFile(join(COMMANDS_DIR, file.name), 'utf8')),
  );

  if (queries.length === 0) {
    throw new Error(`Test case ${command} must contain at least one statement.`);
  }

  return {
    name: command,
    queries: queries,
  };
}

async function getCommands(): Promise<string[]> {
  const entries = await readdir(COMMANDS_DIR, { withFileTypes: true });

  const commands = new Set<string>();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.kql')) {
      continue;
    }

    const fileName = entry.name.slice(0, -'.kql'.length);
    const baseName = fileName.replace(/-\d+$/, '');
    commands.add(baseName);
  }

  return [...commands]
    .sort((left, right) => left.localeCompare(right));
}

async function execute(commandName: string): Promise<Array<unknown>> {
  const command = await getCommand(commandName);
  const update = process.argv.includes('--test-update-snapshots') || process.execArgv.includes('--test-update-snapshots');
  const useMock = !update;
  console.log("[kusto] use mock: "+useMock);
  const { kcsb, close } = getKcsb(useMock);
  const db = "Test";

  try {
    const client = new Client(kcsb);

    try {
      const results: unknown[] = [];
      for (const statement of command.queries) {
        const executableStatement = statement
          .split(/\r?\n/)
          .filter((line) => !line.trimStart().startsWith('//'))
          .join('\n')
          .trim();

        if (executableStatement.length === 0) {
          continue;
        }

        console.log(`[kusto] ${executableStatement}`);
        let response: KustoResponseDataSet;
        if (isManagementCommand(executableStatement)) {
          response = await client.executeMgmt(db, executableStatement);
        } else {
          response = await client.executeQuery(db, executableStatement);
        }

        const primary = response.primaryResults[0];
        assert.ok(primary);

        const data = primary.toJSON();
        results.push(data.data);
      }

      // TODO: .show tables
      // .drop all tables

      return results;
    } finally {
      client.close();
    }
  } finally {
    close?.();
  }
}

snapshot.setResolveSnapshotPath((path) => {
  if (!path) {
    return "";
  }
  console.log("path: "+path);
  path = join(
    path,
    "../",
    "../",
    "../",
    "src",
    "tests",
    "snapshots",
    "commands.test.snapshot.ts", // TODO: do not hardcode
  );
    console.log("path2: "+path);

  return path;
});

const commands = await getCommands();
for (const command of commands) {
  test(`command - ${command}`, async (t) => {
    const results = await execute(command);

    for (const result of results) {
      t.assert.snapshot(serializeForSnapshot(result));
    }
  });
}

test(`sdk query parameters`, async (t) => {
  const update = process.argv.includes('--test-update-snapshots') || process.execArgv.includes('--test-update-snapshots');
  const useMock = !update;
  const { kcsb, close } = getKcsb(useMock);
  console.dir(kcsb);
  const client = new Client(kcsb);
  const db = 'Test';

  try {
    const query = `declare query_parameters(birthday:datetime); print strcat("Your age is: ", datetime_diff('year',now(), birthday))`;

    const crp = new ClientRequestProperties();
    crp.setParameter('birthday', 'datetime(1970-05-11)');

    const response = await client.executeQuery(db, query, crp);
    const primary = response.primaryResults[0];
    assert.ok(primary);

    const data = primary.toJSON();
    t.assert.snapshot(serializeForSnapshot(data.data));
  } finally {
    client.close();
    close?.();
  }
});