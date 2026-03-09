type IngestionProperties = {
    ingestIfNotExists?: Array<string>;
    tags?: Array<string>;
    format?: "json";
    ingestionMappingReference?: string;
};

export const getKustoIngestCommand = (tableName: string, objects: Array<unknown>, ingestionProperties: IngestionProperties | undefined = undefined) => {
    // https://learn.microsoft.com/en-us/kusto/management/data-ingestion/ingest-inline
    // https://learn.microsoft.com/en-us/kusto/management/extent-tags?view=azure-data-explorer&preserve-view=true
    ingestionProperties = ingestionProperties ?? {};
    ingestionProperties.format ??= "json";
    ingestionProperties.ingestionMappingReference ??= "JsonMapping";

    const ingestionPropertiesString = Object.entries(ingestionProperties).map(([key, value]) => {
        let json = JSON.stringify(value);
        if (Array.isArray(value)) {
            json = `'${json}'`;
        }
        return `${key} = ${json}`;
    }).join(", ");

    return [
        `.ingest inline into table ${tableName} with (${ingestionPropertiesString}) <|`,
        objects.map(o => JSON.stringify(o)).join("\n"),
    ].join("\n");
};