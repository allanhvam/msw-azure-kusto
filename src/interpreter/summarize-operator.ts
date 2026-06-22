import type {
  NamedExpressionContext,
  UnnamedExpressionContext,
} from '../parser/KqlParser.js';
import { tryExtractFunctionCall, tryExtractFunctionCallWithStarArguments } from './expression-ast-evaluator.js';
import { getAlias } from './query-ast-parser.js';
import type { KustoRow, KustoScalar, ExecutionContext } from './types.js';

export type SummarizeOperatorOptions = {
  evaluateUnnamedExpression: (unnamedExpression: UnnamedExpressionContext, row: KustoRow, executionContext: ExecutionContext) => KustoScalar;
  normalizeScalar: (value: unknown) => KustoScalar;
  compareValues: (left: KustoScalar, right: KustoScalar) => number;
};

export class SummarizeOperator {
  private readonly options: SummarizeOperatorOptions;

  public constructor(options: SummarizeOperatorOptions) {
    this.options = options;
  }

  public apply(
    rows: KustoRow[],
    aggregations: NamedExpressionContext[],
    by: NamedExpressionContext[],
    executionContext: ExecutionContext,
  ): KustoRow[] {
    if (aggregations.length === 0) {
      throw new Error('summarize requires at least one aggregation.');
    }

    if (by.length === 0) {
      return [this.buildSummarizeAggregationRow(rows, aggregations, executionContext)];
    }

    const groups = new Map<string, { byRow: KustoRow; rows: KustoRow[] }>();
    for (const row of rows) {
      const byRow: KustoRow = {};
      for (const expression of by) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(expression.unnamedExpression(), row, executionContext));
        const name = getAlias(expression) ?? this.getByExpressionName(expression.unnamedExpression());
        byRow[name] = value;
      }

      const key = JSON.stringify(byRow);
      const existing = groups.get(key);
      if (existing) {
        existing.rows.push(row);
      } else {
        groups.set(key, { byRow, rows: [row] });
      }
    }

    return Array.from(groups.values()).map((group) => ({
      ...group.byRow,
      ...this.buildSummarizeAggregationRow(group.rows, aggregations, executionContext),
    }));
  }

  private getByExpressionName(expression: UnnamedExpressionContext): string {
    const text = expression.getText();
    const binMatch = text.match(/^bin\(([_A-Za-z]\w*),/);
    if (binMatch) {
      return binMatch[1];
    }

    return text;
  }

  private buildSummarizeAggregationRow(
    rows: KustoRow[],
    aggregations: NamedExpressionContext[],
    executionContext: ExecutionContext,
  ): KustoRow {
    const result: KustoRow = {};
    for (const aggregation of aggregations) {
      const alias = getAlias(aggregation);
      const rowExpansion = this.tryEvaluateRowExpansionAggregation(aggregation.unnamedExpression(), rows, executionContext);
      if (rowExpansion) {
        if (alias) {
          result[alias] = rowExpansion;
        } else {
          Object.assign(result, rowExpansion);
        }

        continue;
      }

      const name = alias ?? this.inferAggregationColumnName(aggregation.unnamedExpression());
      result[name] = this.evaluateAggregation(aggregation.unnamedExpression(), rows, executionContext);
    }

    return result;
  }

  private tryEvaluateRowExpansionAggregation(
    expression: UnnamedExpressionContext,
    rows: KustoRow[],
    executionContext: ExecutionContext,
  ): KustoRow | null {
    const functionCall = tryExtractFunctionCallWithStarArguments(expression);
    if (!functionCall || functionCall.name.toLowerCase() !== 'arg_max') {
      return null;
    }

    if (functionCall.arguments.length !== 2 || functionCall.arguments[0] === '*' || functionCall.arguments[1] !== '*') {
      throw new Error(`Unsupported summarize aggregation: ${expression.getText()}`);
    }

    const maximizeByExpression = functionCall.arguments[0];
    let selectedRow: KustoRow | null = null;
    let selectedValue: KustoScalar = null;

    for (const row of rows) {
      const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(maximizeByExpression, row, executionContext));
      if (value === null) {
        continue;
      }

      if (selectedValue === null || this.options.compareValues(value, selectedValue) > 0) {
        selectedValue = value;
        selectedRow = row;
      }
    }

    if (!selectedRow) {
      return {};
    }

    return { ...selectedRow };
  }

  private inferAggregationColumnName(expression: UnnamedExpressionContext): string {
    const functionCall = tryExtractFunctionCall(expression);
    if (!functionCall) {
      return expression.getText();
    }

    const functionName = functionCall.name.toLowerCase();
    if (functionName === 'count') {
      return 'Count';
    }

    if (functionName === 'round' && functionCall.arguments.length >= 1) {
      return this.inferAggregationColumnName(functionCall.arguments[0]);
    }

    const argument = functionCall.arguments[0];
    return argument ? `${functionName}_${argument.getText()}` : expression.getText();
  }

  private evaluateAggregation(
    expression: UnnamedExpressionContext,
    rows: KustoRow[],
    executionContext: ExecutionContext,
  ): KustoScalar {
    const functionCall = tryExtractFunctionCall(expression);
    if (!functionCall) {
      throw new Error(`Unsupported summarize aggregation: ${expression.getText()}`);
    }

    const functionName = functionCall.name.toLowerCase();

    if (functionName === 'round') {
      if (functionCall.arguments.length < 1 || functionCall.arguments.length > 2) {
        throw new Error('round() in summarize expects one or two arguments.');
      }

      const innerFunctionCall = tryExtractFunctionCall(functionCall.arguments[0]);
      if (!innerFunctionCall) {
        throw new Error(`Unsupported summarize aggregation: ${expression.getText()}`);
      }

      const innerName = innerFunctionCall.name.toLowerCase();
      if (innerName === 'round' || innerName === 'count' || innerName === 'countif'
        || innerName === 'count_distinct' || innerName === 'make_set') {
        throw new Error(`Unsupported summarize aggregation: ${expression.getText()}`);
      }

      const value = this.evaluateAggregation(functionCall.arguments[0], rows, executionContext);
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return null;
      }

      if (!functionCall.arguments[1]) {
        return Math.round(numericValue);
      }

      const precision = Number(this.options.evaluateUnnamedExpression(functionCall.arguments[1], {}, executionContext));
      if (!Number.isFinite(precision)) {
        return null;
      }

      const factor = 10 ** Math.trunc(precision);
      if (!Number.isFinite(factor) || factor === 0) {
        return null;
      }

      return Math.round(numericValue * factor) / factor;
    }

    if (functionName === 'count') {
      if (functionCall.arguments.length !== 0) {
        throw new Error('count() does not take arguments.');
      }

      return rows.length;
    }

    if (functionCall.arguments.length !== 1) {
      throw new Error(`${functionCall.name}() expects exactly one argument.`);
    }

    const argument = functionCall.arguments[0];

    if (functionName === 'countif') {
      return rows.filter((row) => Boolean(this.options.evaluateUnnamedExpression(argument, row, executionContext))).length;
    }

    if (functionName === 'count_distinct') {
      const values = new Set<string>();
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(argument, row, executionContext));
        if (value === null) {
          continue;
        }

        values.add(JSON.stringify(value));
      }

      return values.size;
    }

    if (functionName === 'make_set') {
      const values = new Set<string>();
      const orderedValues: KustoScalar[] = [];
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(argument, row, executionContext));
        if (value === null) {
          continue;
        }

        const serialized = JSON.stringify(value);
        if (values.has(serialized)) {
          continue;
        }

        values.add(serialized);
        orderedValues.push(value);
      }

      return orderedValues;
    }

    if (functionName === 'sum') {
      let sum = 0;
      for (const row of rows) {
        const value = this.options.evaluateUnnamedExpression(argument, row, executionContext);
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) {
          sum += numberValue;
        }
      }

      return sum;
    }

    if (functionName === 'avg') {
      let sum = 0;
      let count = 0;
      for (const row of rows) {
        const value = this.options.evaluateUnnamedExpression(argument, row, executionContext);
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) {
          sum += numberValue;
          count += 1;
        }
      }

      return count === 0 ? null : sum / count;
    }

    if (functionName === 'min') {
      let minValue: KustoScalar = null;
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(argument, row, executionContext));
        if (value === null) {
          continue;
        }

        if (minValue === null || this.options.compareValues(value, minValue) < 0) {
          minValue = value;
        }
      }

      return minValue;
    }

    if (functionName === 'max') {
      let maxValue: KustoScalar = null;
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(argument, row, executionContext));
        if (value === null) {
          continue;
        }

        if (maxValue === null || this.options.compareValues(value, maxValue) > 0) {
          maxValue = value;
        }
      }

      return maxValue;
    }

    throw new Error(`Unsupported summarize aggregation: ${expression.getText()}`);
  }
}
