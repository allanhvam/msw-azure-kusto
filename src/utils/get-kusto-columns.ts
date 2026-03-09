import z, { type core } from "zod";

export type KustoDataType = "string" | "datetime" | "real" | "bool" | "dynamic";

export const getKustoColumns = (schema: core.$ZodType): Record<string, KustoDataType> => {
  if (schema instanceof z.ZodUnion) {
    const options = schema.options;
    if (!Array.isArray(options)) {
      throw new Error("Expected zod union options to be array.");
    }

    return options.map(getKustoColumns).reduceRight((a, b) => Object.assign(a, b), {});
  }

  if (!(schema instanceof z.ZodObject)) {
    throw new Error("Expected zod schema to be object.");
  }

  const columns: Record<string, KustoDataType> = {};

  const getKustoDataType = (value: core.$ZodType): KustoDataType => {
    // https://learn.microsoft.com/en-us/kusto/query/scalar-data-types/?view=microsoft-fabric
    if (value instanceof z.ZodArray) {
      return "dynamic";
    }
    if (value instanceof z.ZodString) {
      return "string";
    }
    if (value instanceof z.ZodDate) {
      return "datetime";
    }
    if (value instanceof z.ZodNumber) {
      return "real";
    }
    if (value instanceof z.ZodBoolean) {
      return "bool";
    }
    if (value instanceof z.ZodLiteral) {
      if (typeof value.value === "string") {
        return "string";
      }
      throw new Error(`Unrecognized zod literal value ${value.value}`);
    }
    if (value instanceof z.ZodUnion) {
      const dataTypes = value.options.map(getKustoDataType);
      const set = new Set(dataTypes);
      if (set.size > 1) {
        return "dynamic";
      }
      const [first] = set;
      if (!first) {
        throw new Error("Expected at least one data type in union.");
      }
      return first;
    }
    if (value instanceof z.ZodOptional) {
      return getKustoDataType(value.unwrap());
    }
    if (value instanceof z.ZodNullable) {
      return getKustoDataType(value.unwrap());
    }
    throw new Error(`Unrecognized zod type ${value.constructor.name} - could not translate it to a kusto column type.`);
  };

  const shape = schema.shape;
  Object.entries(shape).forEach(([key, value]) => {
    const columnName = key;
    const columnType = getKustoDataType(value);

    columns[columnName] = columnType;
  });

  return columns;
};
