import type z from "zod";
import type { KustoDataType } from "./get-kusto-columns.js";
import { getKustoColumns } from "./get-kusto-columns.js";

export const getKustoTableCommands = (tableName: string, schema: z.ZodType) => {
    const columns = Object.entries(getKustoColumns(schema));
    const columnPairs = columns.map((([c, t]) => [c, t].join(": ")));

    const getMapping = (column: [name: string, t: KustoDataType]) => {
        const [name, t] = column;

        return JSON.stringify(
            {
                column: name,
                datatype: t,
                Properties: {
                    Path: `$.${name}`,
                },
            });
    };

    return [
        `.create table ${tableName} (${columnPairs[0]})`,
        `.alter table ${tableName} (${columnPairs.join(", ")})`,
        `.create-or-alter table ${tableName} ingestion json mapping 'JsonMapping' '[${columns.map(getMapping).join(", ")}]'`,
    ];
};