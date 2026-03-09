import type { UnnamedExpressionContext } from '../parser/KqlParser.js';
import type { KustoRow, KustoScalar, NamedExpressionAst, SummarizeAggregationAst } from './types.js';

export type SummarizeOperatorOptions = {
  evaluateUnnamedExpression: (unnamedExpression: UnnamedExpressionContext, row: KustoRow) => KustoScalar;
  normalizeScalar: (value: unknown) => KustoScalar;
  compareValues: (left: KustoScalar, right: KustoScalar) => number;
};

export class SummarizeOperator {
  private readonly options: SummarizeOperatorOptions;

  public constructor(options: SummarizeOperatorOptions) {
    this.options = options;
  }

  public apply(rows: KustoRow[], aggregations: NamedExpressionAst[], by: NamedExpressionAst[]): KustoRow[] {
    if (aggregations.length === 0) {
      throw new Error('summarize requires at least one aggregation.');
    }

    const aggregationSpecs = aggregations.map((aggregation) => ({
      aggregation,
      spec: this.parseSummarizeAggregation(aggregation.expression),
    }));

    if (by.length === 0) {
      return [this.buildSummarizeAggregationRow(rows, aggregationSpecs)];
    }

    const groups = new Map<string, { byRow: KustoRow; rows: KustoRow[] }>();
    for (const row of rows) {
      const byRow: KustoRow = {};
      for (const expression of by) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(expression.expression, row));
        const name = expression.alias ?? this.getByExpressionName(expression.expression);
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
      ...this.buildSummarizeAggregationRow(group.rows, aggregationSpecs),
    }));
  }

  private getByExpressionName(expression: UnnamedExpressionContext): string {
    const text = (expression as { getText(): string }).getText();
    const binMatch = text.match(/^bin\(([_A-Za-z]\w*),/);
    if (binMatch) {
      return binMatch[1];
    }

    return text;
  }

  private buildSummarizeAggregationRow(
    rows: KustoRow[],
    aggregationSpecs: Array<{ aggregation: NamedExpressionAst; spec: SummarizeAggregationAst }>,
  ): KustoRow {
    const result: KustoRow = {};
    for (const { aggregation, spec } of aggregationSpecs) {
      const name = aggregation.alias ?? this.getAggregationColumnName(spec);
      result[name] = this.evaluateAggregation(spec, rows);
    }

    return result;
  }

  private getAggregationColumnName(spec: SummarizeAggregationAst): string {
    if (spec.kind === 'count') {
      return 'Count';
    }

    if (spec.kind === 'round') {
      return this.getAggregationColumnName(spec.valueAggregation);
    }

    const expression = (spec.kind === 'countif'
      ? spec.predicateExpression
      : spec.valueExpression) as { getText(): string };
    return `${spec.kind}_${expression.getText()}`;
  }

  private evaluateAggregation(spec: SummarizeAggregationAst, rows: KustoRow[]): KustoScalar {
    if (spec.kind === 'round') {
      const value = this.evaluateAggregation(spec.valueAggregation, rows);
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return null;
      }

      if (!spec.precisionExpression) {
        return Math.round(numericValue);
      }

      const precision = Number(this.options.evaluateUnnamedExpression(spec.precisionExpression, {}));
      if (!Number.isFinite(precision)) {
        return null;
      }

      const factor = 10 ** Math.trunc(precision);
      if (!Number.isFinite(factor) || factor === 0) {
        return null;
      }

      return Math.round(numericValue * factor) / factor;
    }

    if (spec.kind === 'count') {
      return rows.length;
    }

    if (spec.kind === 'countif') {
      return rows.filter((row) => Boolean(this.options.evaluateUnnamedExpression(spec.predicateExpression, row))).length;
    }

    if (spec.kind === 'count_distinct') {
      const values = new Set<string>();
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(spec.valueExpression, row));
        if (value === null) {
          continue;
        }

        values.add(JSON.stringify(value));
      }

      return values.size;
    }

    if (spec.kind === 'make_set') {
      const values = new Set<string>();
      const orderedValues: KustoScalar[] = [];
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(spec.valueExpression, row));
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

      return orderedValues as unknown as KustoScalar;
    }

    if (spec.kind === 'sum') {
      let sum = 0;
      for (const row of rows) {
        const value = this.options.evaluateUnnamedExpression(spec.valueExpression, row);
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) {
          sum += numberValue;
        }
      }

      return sum;
    }

    if (spec.kind === 'avg') {
      let sum = 0;
      let count = 0;
      for (const row of rows) {
        const value = this.options.evaluateUnnamedExpression(spec.valueExpression, row);
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) {
          sum += numberValue;
          count += 1;
        }
      }

      return count === 0 ? null : sum / count;
    }

    if (spec.kind === 'min') {
      let minValue: KustoScalar = null;
      for (const row of rows) {
        const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(spec.valueExpression, row));
        if (value === null) {
          continue;
        }

        if (minValue === null || this.options.compareValues(value, minValue) < 0) {
          minValue = value;
        }
      }

      return minValue;
    }

    let maxValue: KustoScalar = null;
    for (const row of rows) {
      const value = this.options.normalizeScalar(this.options.evaluateUnnamedExpression(spec.valueExpression, row));
      if (value === null) {
        continue;
      }

      if (maxValue === null || this.options.compareValues(value, maxValue) > 0) {
        maxValue = value;
      }
    }

    return maxValue;
  }

  private parseSummarizeAggregation(expression: UnnamedExpressionContext): SummarizeAggregationAst {
    const functionCall = this.tryParseSimpleSummarizeFunctionCall(expression);
    if (!functionCall) {
      throw new Error(`Unsupported summarize aggregation: ${(expression as { getText(): string }).getText()}`);
    }

    const functionName = functionCall.name.toLowerCase();
    if (functionName === 'round') {
      if (functionCall.arguments.length < 1 || functionCall.arguments.length > 2) {
        throw new Error('round() in summarize expects one or two arguments.');
      }

      const valueAggregation = this.parseSummarizeAggregation(functionCall.arguments[0]);
      if (
        valueAggregation.kind === 'round'
        || valueAggregation.kind === 'count'
        || valueAggregation.kind === 'countif'
        || valueAggregation.kind === 'count_distinct'
        || valueAggregation.kind === 'make_set'
      ) {
        throw new Error(`Unsupported summarize aggregation: ${(expression as { getText(): string }).getText()}`);
      }

      return {
        kind: 'round',
        valueAggregation,
        precisionExpression: functionCall.arguments[1] ?? null,
      };
    }

    if (functionName === 'count') {
      if (functionCall.arguments.length !== 0) {
        throw new Error('count() does not take arguments.');
      }

      return { kind: 'count' };
    }

    if (functionCall.arguments.length !== 1) {
      throw new Error(`${functionCall.name}() expects exactly one argument.`);
    }

    const argument = functionCall.arguments[0];
    if (functionName === 'countif') {
      return {
        kind: 'countif',
        predicateExpression: argument,
      };
    }

    if (functionName === 'count_distinct') {
      return {
        kind: 'count_distinct',
        valueExpression: argument,
      };
    }

    if (functionName === 'make_set') {
      return {
        kind: 'make_set',
        valueExpression: argument,
      };
    }

    if (functionName === 'sum') {
      return {
        kind: 'sum',
        valueExpression: argument,
      };
    }

    if (functionName === 'avg') {
      return {
        kind: 'avg',
        valueExpression: argument,
      };
    }

    if (functionName === 'min') {
      return {
        kind: 'min',
        valueExpression: argument,
      };
    }

    if (functionName === 'max') {
      return {
        kind: 'max',
        valueExpression: argument,
      };
    }

    throw new Error(`Unsupported summarize aggregation: ${(expression as { getText(): string }).getText()}`);
  }

  private tryParseSimpleSummarizeFunctionCall(
    unnamedExpression: UnnamedExpressionContext,
  ): { name: string; arguments: UnnamedExpressionContext[] } | null {
    const logicalOrExpression = (unnamedExpression as {
      logicalOrExpression(): {
        logicalAndExpression(): {
          equalityExpression(): {
            relationalExpression(): {
              additiveExpression(): unknown[];
              LESSTHAN(): unknown | null;
              GREATERTHAN(): unknown | null;
              LESSTHAN_EQUAL(): unknown | null;
              GREATERTHAN_EQUAL(): unknown | null;
            } | null;
            equalsEqualityExpression(): unknown | null;
          };
          logicalAndOperation(): unknown[];
        };
        logicalOrOperation(): unknown[];
      };
    }).logicalOrExpression();

    if (logicalOrExpression.logicalOrOperation().length > 0) {
      return null;
    }

    const logicalAndExpression = logicalOrExpression.logicalAndExpression();
    if (logicalAndExpression.logicalAndOperation().length > 0) {
      return null;
    }

    const equalityExpression = logicalAndExpression.equalityExpression();
    if (equalityExpression.equalsEqualityExpression()) {
      return null;
    }

    const relationalExpression = equalityExpression.relationalExpression();
    if (!relationalExpression) {
      return null;
    }

    if (
      relationalExpression.LESSTHAN() ||
      relationalExpression.GREATERTHAN() ||
      relationalExpression.LESSTHAN_EQUAL() ||
      relationalExpression.GREATERTHAN_EQUAL()
    ) {
      return null;
    }

    const additiveExpressions = relationalExpression.additiveExpression();
    if (additiveExpressions.length !== 1) {
      return null;
    }

    const additiveExpression = additiveExpressions[0] as {
      multiplicativeExpression(): unknown;
      additiveOperation(): unknown[];
    };
    if (additiveExpression.additiveOperation().length > 0) {
      return null;
    }

    const multiplicativeExpression = additiveExpression.multiplicativeExpression() as {
      stringOperatorExpression(): unknown;
      multiplicativeOperation(): unknown[];
    };
    if (multiplicativeExpression.multiplicativeOperation().length > 0) {
      return null;
    }

    const stringOperatorExpression = multiplicativeExpression.stringOperatorExpression() as {
      stringBinaryOperatorExpression():
        | {
            invocationExpression(): unknown;
            stringBinaryOperation(): unknown | null;
          }
        | null;
      stringStarOperatorExpression(): unknown | null;
    };

    if (stringOperatorExpression.stringStarOperatorExpression()) {
      return null;
    }

    const binary = stringOperatorExpression.stringBinaryOperatorExpression();
    if (!binary || binary.stringBinaryOperation()) {
      return null;
    }

    const invocationExpression = binary.invocationExpression() as {
      PLUS(): unknown | null;
      DASH(): unknown | null;
      functionCallOrPathExpression(): {
        functionCallOrPathRoot(): unknown | null;
        functionCallOrPathPathExpression(): unknown | null;
        toTableExpression(): unknown | null;
      };
    };

    if (invocationExpression.PLUS() || invocationExpression.DASH()) {
      return null;
    }

    const functionCallOrPathExpression = invocationExpression.functionCallOrPathExpression();
    if (functionCallOrPathExpression.toTableExpression() || functionCallOrPathExpression.functionCallOrPathPathExpression()) {
      return null;
    }

    const root = functionCallOrPathExpression.functionCallOrPathRoot();
    if (!root) {
      return null;
    }

    const rootContext = root as {
      dotCompositeFunctionCallExpression():
        | {
            functionCallExpression(): {
              namedFunctionCallExpression():
                | {
                    simpleNameReference(): { getText(): string };
                    argumentExpression(): Array<{
                      namedExpression(): { unnamedExpression(): UnnamedExpressionContext } | null;
                      starExpression(): unknown | null;
                    }>;
                  }
                | null;
              countExpression():
                | {
                    namedExpression(): { unnamedExpression(): UnnamedExpressionContext } | null;
                  }
                | null;
            };
            dotCompositeFunctionCallOperation(): unknown[];
          }
        | null;
      primaryExpression(): unknown | null;
      toScalarExpression(): unknown | null;
    };

    if (rootContext.primaryExpression() || rootContext.toScalarExpression()) {
      return null;
    }

    const dotFunctionCall = rootContext.dotCompositeFunctionCallExpression();
    if (!dotFunctionCall || dotFunctionCall.dotCompositeFunctionCallOperation().length > 0) {
      return null;
    }

    const functionCall = dotFunctionCall.functionCallExpression();
    const countExpression = functionCall.countExpression();
    if (countExpression) {
      const argument = countExpression.namedExpression()?.unnamedExpression();
      return {
        name: 'count',
        arguments: argument ? [argument] : [],
      };
    }

    const namedFunctionCall = functionCall.namedFunctionCallExpression();
    if (!namedFunctionCall) {
      return null;
    }

    const argumentsList = namedFunctionCall.argumentExpression().map((argumentExpression) => {
      if (argumentExpression.starExpression()) {
        throw new Error('Star arguments are not supported for summarize aggregations.');
      }

      const namedExpression = argumentExpression.namedExpression();
      if (!namedExpression) {
        throw new Error('Invalid summarize aggregation argument.');
      }

      return namedExpression.unnamedExpression();
    });

    return {
      name: namedFunctionCall.simpleNameReference().getText(),
      arguments: argumentsList,
    };
  }
}
