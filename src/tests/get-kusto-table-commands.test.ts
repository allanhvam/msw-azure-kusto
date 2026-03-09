import assert from 'node:assert';
import test from 'node:test';
import { z } from 'zod';
import { KustoInterpreter } from '../interpreter/index.js';
import { getKustoTableCommands } from '../utils/get-kusto-table-commands.js';

test('getKustoTableCommands output can be executed and validated with .show tables', async () => {
  const interpreter = new KustoInterpreter();
  const schema = z.object({
    EventId: z.number(),
    State: z.string(),
  });

  const commands = getKustoTableCommands('StormEvents', schema);

  for (const command of commands) {
    const result = await interpreter.execute(command);
    assert.equal(result.kind, 'management');
  }

  const showTables = await interpreter.execute('.show tables');

  assert.equal(showTables.kind, 'management');
  assert.deepEqual(showTables.rows, [
    { TableName: 'StormEvents' },
  ]);
});
