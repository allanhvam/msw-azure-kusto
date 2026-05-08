import { getRowIngestionTime } from './ingestion-time.js';
import type {
  AdditiveExpressionContext,
  BetweenEqualityExpressionContext,
  DotCompositeFunctionCallExpressionContext,
  EqualsEqualityExpressionContext,
  FunctionCallOrPathPathExpressionContext,
  InvocationExpressionContext,
  ListEqualityExpressionContext,
  LogicalAndExpressionContext,
  LogicalOrExpressionContext,
  MultiplicativeExpressionContext,
  PrimaryExpressionContext,
  RelationalExpressionContext,
  StringBinaryOperatorExpressionContext,
  StringStarOperatorExpressionContext,
  ToScalarExpressionContext,
  UnnamedExpressionContext,
} from '../parser/KqlParser.js';
import { KqlVisitor } from '../parser/KqlVisitor.js';
import type { KustoRow, KustoScalar, ExecutionContext } from './types.js';
import { EMPTY_EXECUTION_CONTEXT } from './types.js';

export type ExpressionAstEvaluatorOptions = {
  parseScalar: (text: string) => KustoScalar;
  normalizeScalar: (value: unknown) => KustoScalar;
  compareValues: (left: KustoScalar, right: KustoScalar) => number;
  evaluateToScalarExpression: (toScalarExpression: ToScalarExpressionContext, executionContext: ExecutionContext) => KustoScalar;
};

export class ExpressionAstEvaluator extends KqlVisitor<KustoScalar> {
  private readonly options: ExpressionAstEvaluatorOptions;
  private currentRow: KustoRow = {};
  private currentExecutionContext: ExecutionContext = EMPTY_EXECUTION_CONTEXT;

  public constructor(options: ExpressionAstEvaluatorOptions) {
    super();
    this.options = options;
  }

  public evaluateUnnamedExpression(
    unnamedExpression: UnnamedExpressionContext,
    row: KustoRow,
    executionContext: ExecutionContext,
  ): KustoScalar {
    const previousRow = this.currentRow;
    const previousExecutionContext = this.currentExecutionContext;
    this.currentRow = row;
    this.currentExecutionContext = executionContext;
    try {
      return this.visit(unnamedExpression.logicalOrExpression())!;
    } finally {
      this.currentRow = previousRow;
      this.currentExecutionContext = previousExecutionContext;
    }
  }

  public createRangeRows(
    columnName: string,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
    executionContext: ExecutionContext,
  ): KustoRow[] {
    const from = this.evaluateUnnamedExpression(fromExpression, {}, executionContext);
    const to = this.evaluateUnnamedExpression(toExpression, {}, executionContext);
    const step = this.evaluateUnnamedExpression(stepExpression, {}, executionContext);

    const fromNumber = Number(from);
    const toNumber = Number(to);
    const stepNumber = Number(step);
    if (Number.isFinite(fromNumber) && Number.isFinite(toNumber) && Number.isFinite(stepNumber) && stepNumber > 0) {
      const rows: KustoRow[] = [];
      for (let current = fromNumber; current <= toNumber; current += stepNumber) {
        rows.push({ [columnName]: current });
      }

      return rows;
    }

    const fromDate = this.toDate(from);
    const toDate = this.toDate(to);
    const stepMilliseconds = this.toTimespanMilliseconds(step);
    if (fromDate && toDate && stepMilliseconds !== null && stepMilliseconds > 0) {
      const rows: KustoRow[] = [];
      for (let current = fromDate.getTime(); current <= toDate.getTime(); current += stepMilliseconds) {
        rows.push({ [columnName]: new Date(current).toISOString() });
      }

      return rows;
    }

    throw new Error('Unsupported range expression values.');
  }

  visitLogicalOrExpression = (ctx: LogicalOrExpressionContext): KustoScalar => {
    const operations = ctx.logicalOrOperation();
    if (operations.length === 0) {
      return this.visit(ctx.logicalAndExpression())!;
    }

    let value = this.toBoolOrNull(this.visit(ctx.logicalAndExpression()));
    for (const operation of operations) {
      if (value === true) {
        break;
      }
      const right = this.toBoolOrNull(this.visit(operation.logicalAndExpression()));
      if (right === true) {
        value = true;
      } else if (value === null || right === null) {
        value = null;
      } else {
        value = false;
      }
    }

    return value;
  };

  visitLogicalAndExpression = (ctx: LogicalAndExpressionContext): KustoScalar => {
    const operations = ctx.logicalAndOperation();
    if (operations.length === 0) {
      return this.visit(ctx.equalityExpression())!;
    }

    let value = this.toBoolOrNull(this.visit(ctx.equalityExpression()));
    for (const operation of operations) {
      if (value === false) {
        break;
      }
      const right = this.toBoolOrNull(this.visit(operation.equalityExpression()));
      if (right === false) {
        value = false;
      } else if (value === null || right === null) {
        value = null;
      } else {
        value = true;
      }
    }

    return value;
  };

  private toBoolOrNull(value: KustoScalar | undefined): boolean | null {
    if (value === null || value === undefined) {
      return null;
    }
    return Boolean(value);
  }

  visitEqualsEqualityExpression = (ctx: EqualsEqualityExpressionContext): KustoScalar => {
    const leftValue = this.visit(ctx.relationalExpression(0)!)!;
    const rightValue = this.visit(ctx.relationalExpression(1)!)!;
    const isEqual = this.compareScalars(leftValue, rightValue) === 0;
    return ctx.EQUALEQUAL() ? isEqual : !isEqual;
  };

  visitListEqualityExpression = (ctx: ListEqualityExpressionContext): KustoScalar => {
    const leftValue = this.visit(ctx.relationalExpression())!;
    const listValues = ctx.invocationExpression().map((item) => this.visit(item)!);
    const isIn = listValues.some((item) => this.options.compareValues(leftValue, item) === 0);

    if (ctx.NOT_IN() || ctx.NOT_IN_CI()) {
      return !isIn;
    }

    if (ctx.IN() || ctx.IN_CI()) {
      return isIn;
    }

    throw new Error('Unsupported list equality expression operator.');
  };

  visitBetweenEqualityExpression = (ctx: BetweenEqualityExpressionContext): KustoScalar => {
    const leftValue = this.visit(ctx.relationalExpression())!;
    const startValue = this.visit(ctx.invocationExpression(0)!)!;
    const endValue = this.visit(ctx.invocationExpression(1)!)!;
    const leftDate = this.toDate(leftValue);
    const startDate = this.toDate(startValue);
    const endDate = this.toDate(endValue);
    const isBetween =
      leftDate && startDate && endDate
        ? leftDate.getTime() >= startDate.getTime() && leftDate.getTime() <= endDate.getTime()
        : this.options.compareValues(leftValue, startValue) >= 0 && this.options.compareValues(leftValue, endValue) <= 0;
    return ctx.NOT_BETWEEN() ? !isBetween : isBetween;
  };

  visitRelationalExpression = (ctx: RelationalExpressionContext): KustoScalar => {
    const additiveExpressions = ctx.additiveExpression();
    const leftValue = this.visit(additiveExpressions[0])!;
    if (additiveExpressions.length === 1) {
      return leftValue;
    }

    const rightValue = this.visit(additiveExpressions[1])!;

    if (
      typeof leftValue === 'string' && typeof rightValue === 'string'
      && !this.looksLikeDatetime(leftValue) && !this.looksLikeDatetime(rightValue)
    ) {
      throw new Error('Cannot compare values of types string and string. Try adding explicit casts.');
    }

    const comparison = this.compareScalars(leftValue, rightValue);
    if (ctx.LESSTHAN()) {
      return comparison < 0;
    }

    if (ctx.GREATERTHAN()) {
      return comparison > 0;
    }

    if (ctx.LESSTHAN_EQUAL()) {
      return comparison <= 0;
    }

    if (ctx.GREATERTHAN_EQUAL()) {
      return comparison >= 0;
    }

    throw new Error('Unsupported relational expression.');
  };

  visitAdditiveExpression = (ctx: AdditiveExpressionContext): KustoScalar => {
    const operations = ctx.additiveOperation();
    if (operations.length === 0) {
      return this.visit(ctx.multiplicativeExpression())!;
    }

    let value = this.visit(ctx.multiplicativeExpression());
    for (const operation of operations) {
      const right = this.visit(operation.multiplicativeExpression());
      value = this.evaluateAdditiveOperation(value, right, Boolean(operation.PLUS()));
    }

    return value;
  };

  visitMultiplicativeExpression = (ctx: MultiplicativeExpressionContext): KustoScalar => {
    const operations = ctx.multiplicativeOperation();
    if (operations.length === 0) {
      return this.visit(ctx.stringOperatorExpression())!;
    }

    const initialExpression = ctx.stringOperatorExpression();
    let value = Number(this.visit(initialExpression));
    let hasRealSemantics = this.expressionHasRealNumberSemantics(initialExpression.getText());

    for (const operation of operations) {
      const rightExpression = operation.stringOperatorExpression();
      const right = Number(this.visit(rightExpression));
      const rightHasRealSemantics = this.expressionHasRealNumberSemantics(rightExpression.getText());

      if (operation.ASTERISK()) {
        value *= right;
        hasRealSemantics = hasRealSemantics || rightHasRealSemantics;
      } else if (operation.SLASH()) {
        if (!hasRealSemantics && !rightHasRealSemantics && Number.isInteger(value) && Number.isInteger(right)) {
          value = Math.trunc(value / right);
        } else {
          value /= right;
          hasRealSemantics = true;
        }
      } else {
        value %= right;
        hasRealSemantics = hasRealSemantics || rightHasRealSemantics;
      }
    }

    return value;
  };

  private expressionHasRealNumberSemantics(expressionText: string): boolean {
    const text = expressionText.toLowerCase();
    if (text.includes('todouble(')) {
      return true;
    }

    // Decimal and scientific-notation literals imply floating-point arithmetic.
    if (/\b\d+\.\d+\b/.test(text) || /\b\d+(?:\.\d+)?e[+-]?\d+\b/i.test(text)) {
      return true;
    }

    return false;
  }

  visitStringBinaryOperatorExpression = (ctx: StringBinaryOperatorExpressionContext): KustoScalar => {
    const leftValue = this.visit(ctx.invocationExpression())!;
    const operation = ctx.stringBinaryOperation();
    if (!operation) {
      return leftValue;
    }

    const rightValue = this.visit(operation.invocationExpression())!;
    const operator = operation.stringBinaryOperator();
    const operatorText = operator ? operator.getText().toLowerCase() : 'has';
    return this.evaluateStringBinaryOperator(operatorText, leftValue, rightValue);
  };

  visitStringStarOperatorExpression = (ctx: StringStarOperatorExpressionContext): KustoScalar => {
    const operator = ctx.stringBinaryOperator().getText().toLowerCase();
    const rightValue = this.visit(ctx.invocationExpression())!;
    return this.evaluateStringBinaryOperator(operator, '', rightValue);
  };

  private evaluateStringBinaryOperator(operator: string, left: KustoScalar, right: KustoScalar): boolean {
    const leftStr = left === null || left === undefined ? '' : String(left);
    const rightStr = right === null || right === undefined ? '' : String(right);

    switch (operator) {
      case '=~':
        return leftStr.toLowerCase() === rightStr.toLowerCase();
      case '!~':
        return leftStr.toLowerCase() !== rightStr.toLowerCase();
      case 'has':
      case ':':
        return this.kustoHas(leftStr, rightStr, false);
      case '!has':
        return !this.kustoHas(leftStr, rightStr, false);
      case 'has_cs':
        return this.kustoHas(leftStr, rightStr, true);
      case '!has_cs':
        return !this.kustoHas(leftStr, rightStr, true);
      case 'hasprefix':
        return leftStr.toLowerCase().startsWith(rightStr.toLowerCase());
      case '!hasprefix':
        return !leftStr.toLowerCase().startsWith(rightStr.toLowerCase());
      case 'hasprefix_cs':
        return leftStr.startsWith(rightStr);
      case '!hasprefix_cs':
        return !leftStr.startsWith(rightStr);
      case 'hassuffix':
        return leftStr.toLowerCase().endsWith(rightStr.toLowerCase());
      case '!hassuffix':
        return !leftStr.toLowerCase().endsWith(rightStr.toLowerCase());
      case 'hassuffix_cs':
        return leftStr.endsWith(rightStr);
      case '!hassuffix_cs':
        return !leftStr.endsWith(rightStr);
      case 'contains':
      case 'contains_cs': {
        const cs = operator === 'contains_cs';
        return cs ? leftStr.includes(rightStr) : leftStr.toLowerCase().includes(rightStr.toLowerCase());
      }
      case 'notcontains':
      case '!contains':
        return !leftStr.toLowerCase().includes(rightStr.toLowerCase());
      case 'notcontains_cs':
      case '!contains_cs':
        return !leftStr.includes(rightStr);
      case 'startswith':
        return leftStr.toLowerCase().startsWith(rightStr.toLowerCase());
      case '!startswith':
        return !leftStr.toLowerCase().startsWith(rightStr.toLowerCase());
      case 'startswith_cs':
        return leftStr.startsWith(rightStr);
      case '!startswith_cs':
        return !leftStr.startsWith(rightStr);
      case 'endswith':
        return leftStr.toLowerCase().endsWith(rightStr.toLowerCase());
      case '!endswith':
        return !leftStr.toLowerCase().endsWith(rightStr.toLowerCase());
      case 'endswith_cs':
        return leftStr.endsWith(rightStr);
      case '!endswith_cs':
        return !leftStr.endsWith(rightStr);
      case 'matches regex':
      case 'matches_regex': {
        const regex = new RegExp(rightStr);
        return regex.test(leftStr);
      }
      default:
        throw new Error(`Unsupported string binary operator: ${operator}`);
    }
  }

  private kustoHas(source: string, term: string, caseSensitive: boolean): boolean {
    const s = caseSensitive ? source : source.toLowerCase();
    const t = caseSensitive ? term : term.toLowerCase();
    if (t.length === 0) {
      return true;
    }

    const index = s.indexOf(t);
    if (index === -1) {
      return false;
    }

    const isWordBoundary = (ch: string | undefined): boolean => {
      if (ch === undefined) {
        return true;
      }

      return !/[\p{L}\p{N}_]/u.test(ch);
    };

    // Check all occurrences for whole-term match
    let pos = 0;
    while (true) {
      const idx = s.indexOf(t, pos);
      if (idx === -1) {
        return false;
      }

      if (isWordBoundary(s[idx - 1]) && isWordBoundary(s[idx + t.length])) {
        return true;
      }

      pos = idx + 1;
    }
  }

  visitInvocationExpression = (ctx: InvocationExpressionContext): KustoScalar => {
    const value = this.visit(ctx.functionCallOrPathExpression())!;
    if (ctx.PLUS()) {
      return Number(value);
    }

    if (ctx.DASH()) {
      return -Number(value);
    }

    return value;
  };

  visitFunctionCallOrPathPathExpression = (ctx: FunctionCallOrPathPathExpressionContext): KustoScalar => {
    let current: unknown = this.visit(ctx.functionCallOrPathRoot());
    for (const operation of ctx.functionCallOrPathOperation()) {
      current = this.coerceDynamicContainer(current);
      const pathOperation = operation.functionCallOrPathPathOperation();
      if (pathOperation) {
        const name = pathOperation.identifierOrKeywordOrEscapedName()!.getText();
        if (current && typeof current === 'object') {
          current = (current as Record<string, unknown>)[name];
          continue;
        }

        throw new Error(`Cannot access path '${name}' on non-object value.`);
      }

      const elementOperation = operation.functionCallOrPathElementOperation();
      if (elementOperation) {
        const index = this.evaluateUnnamedExpression(elementOperation.unnamedExpression()!, this.currentRow, this.currentExecutionContext);
        if (Array.isArray(current)) {
          current = current[Number(index)];
          continue;
        }

        if (current && typeof current === 'object') {
          current = (current as Record<string, unknown>)[String(index)];
          continue;
        }

        throw new Error('Cannot index non-collection value.');
      }
    }

    return this.options.normalizeScalar(current);
  };

  visitDotCompositeFunctionCallExpression = (ctx: DotCompositeFunctionCallExpressionContext): KustoScalar => {
    return this.evaluateDotCompositeFunctionCallExpression(ctx);
  };

  visitToScalarExpression = (ctx: ToScalarExpressionContext): KustoScalar => {
    return this.options.evaluateToScalarExpression(ctx, this.currentExecutionContext);
  };

  visitToTableExpression = (): KustoScalar => {
    throw new Error('toTable() is not supported.');
  };

  visitPrimaryExpression = (ctx: PrimaryExpressionContext): KustoScalar => {
    const literal = ctx.unsignedLiteralExpression();
    if (literal) {
      return this.options.parseScalar(literal.getText());
    }

    const nameReference = ctx.nameReferenceWithDataScope();
    if (nameReference) {
      const name = nameReference.simpleNameReference().getText();
      if (Object.hasOwn(this.currentRow, name)) {
        return this.currentRow[name];
      }

      if (Object.hasOwn(this.currentExecutionContext.bindings, name)) {
        return this.currentExecutionContext.bindings[name];
      }

      return null;
    }

    const parenthesized = ctx.parenthesizedExpression();
    if (parenthesized) {
      const innerPipe = parenthesized.expression().pipeExpression();
      if (innerPipe.pipedOperator().length > 0) {
        throw new Error('Piped subexpressions are not supported inside scalar expressions.');
      }

      const inner = innerPipe.beforePipeExpression().unnamedExpression();
      if (!inner) {
        throw new Error('Unsupported parenthesized expression.');
      }

      return this.evaluateUnnamedExpression(inner, this.currentRow, this.currentExecutionContext);
    }

    throw new Error(`Unsupported primary expression: ${ctx.getText()}`);
  };

  private evaluateDotCompositeFunctionCallExpression(
    dotCompositeFunctionCallExpression: DotCompositeFunctionCallExpressionContext,
  ): KustoScalar {
    const functionCall = this.getSimpleFunctionCall(dotCompositeFunctionCallExpression);
    if (!functionCall) {
      throw new Error(`Unsupported function call: ${dotCompositeFunctionCallExpression.getText()}`);
    }

    const functionName = functionCall.name.toLowerCase();
    const argumentsValues = functionCall.arguments.map((argument) => this.visit(argument)!);

    if (functionName === 'ingestion_time') {
      if (argumentsValues.length !== 0) {
        throw new Error('ingestion_time() does not take arguments.');
      }

      return getRowIngestionTime(this.currentRow);
    }

    if (functionName === 'bin') {
      if (argumentsValues.length !== 2) {
        throw new Error('bin() expects exactly two arguments.');
      }

      return this.evaluateBinFunction(argumentsValues[0], argumentsValues[1]);
    }

    if (functionName === 'datetime_add') {
      if (argumentsValues.length !== 3) {
        throw new Error('datetime_add() expects exactly three arguments.');
      }

      return this.evaluateDatetimeAddFunction(argumentsValues[0], argumentsValues[1], argumentsValues[2]);
    }

    if (functionName === 'datetime_diff') {
      if (argumentsValues.length !== 3) {
        throw new Error('datetime_diff() expects exactly three arguments.');
      }

      return this.evaluateDatetimeDiffFunction(argumentsValues[0], argumentsValues[1], argumentsValues[2]);
    }

    if (functionName === 'not') {
      if (argumentsValues.length !== 1) {
        throw new Error('not() expects exactly one argument.');
      }

      const arg = argumentsValues[0];
      if (arg === null || arg === undefined) {
        return null;
      }
      return !arg;
    }

    if (functionName === 'todatetime') {
      if (argumentsValues.length !== 1) {
        throw new Error('todatetime() expects exactly one argument.');
      }

      const date = this.toDate(argumentsValues[0]);
      return date ? date.toISOString() : null;
    }

    if (functionName === 'todouble') {
      if (argumentsValues.length !== 1) {
        throw new Error('todouble() expects exactly one argument.');
      }

      return this.evaluateToDoubleFunction(argumentsValues[0]);
    }

    if (functionName === 'round') {
      if (argumentsValues.length < 1 || argumentsValues.length > 2) {
        throw new Error('round() expects one or two arguments.');
      }

      return this.evaluateRoundFunction(argumentsValues[0], argumentsValues[1]);
    }

    if (functionName === 'array_length') {
      if (argumentsValues.length !== 1) {
        throw new Error('array_length() expects exactly one argument.');
      }

      return this.evaluateArrayLengthFunction(argumentsValues[0]);
    }

    if (functionName === 'iff') {
      if (argumentsValues.length !== 3) {
        throw new Error('iff() expects exactly three arguments.');
      }

      return argumentsValues[0] ? argumentsValues[1] : argumentsValues[2];
    }

    if (functionName === 'case') {
      if (argumentsValues.length < 3 || argumentsValues.length % 2 === 0) {
        throw new Error('case() expects an odd number of arguments with an else value.');
      }

      return this.evaluateCaseFunction(argumentsValues);
    }

    if (functionName === 'startofday') {
      if (argumentsValues.length < 1 || argumentsValues.length > 2) {
        throw new Error('startofday() expects one or two arguments.');
      }

      return this.evaluateStartOfDayFunction(argumentsValues[0], argumentsValues[1]);
    }

    if (functionName === 'bin_at') {
      if (argumentsValues.length !== 3) {
        throw new Error('bin_at() expects exactly three arguments.');
      }

      return this.evaluateBinAtFunction(argumentsValues[0], argumentsValues[1], argumentsValues[2]);
    }

    if (functionName === 'range') {
      if (argumentsValues.length !== 3) {
        throw new Error('range() expects exactly three arguments.');
      }

      return this.evaluateRangeFunction(argumentsValues[0], argumentsValues[1], argumentsValues[2]);
    }

    if (functionName === 'strlen') {
      if (argumentsValues.length !== 1) {
        throw new Error('strlen() expects exactly one argument.');
      }

      const str = argumentsValues[0];
      return str === null || str === undefined ? null : String(str).length;
    }

    if (functionName === 'toupper') {
      if (argumentsValues.length !== 1) {
        throw new Error('toupper() expects exactly one argument.');
      }

      const str = argumentsValues[0];
      return str === null || str === undefined ? '' : String(str).toUpperCase();
    }

    if (functionName === 'tolower') {
      if (argumentsValues.length !== 1) {
        throw new Error('tolower() expects exactly one argument.');
      }

      const str = argumentsValues[0];
      return str === null || str === undefined ? '' : String(str).toLowerCase();
    }

    if (functionName === 'substring') {
      if (argumentsValues.length < 2 || argumentsValues.length > 3) {
        throw new Error('substring() expects two or three arguments.');
      }

      const str = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      const start = Number(argumentsValues[1]);
      if (!Number.isFinite(start)) {
        return '';
      }

      if (argumentsValues.length === 3) {
        const length = Number(argumentsValues[2]);
        if (!Number.isFinite(length)) {
          return '';
        }

        return str.substring(start, start + length);
      }

      return str.substring(start);
    }

    if (functionName === 'split') {
      if (argumentsValues.length < 2 || argumentsValues.length > 3) {
        throw new Error('split() expects two or three arguments.');
      }

      const str = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      const delimiter = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      const parts = str.split(delimiter);

      if (argumentsValues.length === 3) {
        const index = Number(argumentsValues[2]);
        return Number.isFinite(index) && index >= 0 && index < parts.length ? parts[index] : null;
      }

      return parts;
    }

    if (functionName === 'strcat') {
      if (argumentsValues.length < 1) {
        throw new Error('strcat() expects at least one argument.');
      }

      return argumentsValues.map((v) => (v === null || v === undefined ? '' : String(v))).join('');
    }

    if (functionName === 'strcat_delim') {
      if (argumentsValues.length < 3) {
        throw new Error('strcat_delim() expects at least three arguments.');
      }

      const delimiter = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      return argumentsValues.slice(1).map((v) => (v === null || v === undefined ? '' : String(v))).join(delimiter);
    }

    if (functionName === 'trim') {
      if (argumentsValues.length !== 2) {
        throw new Error('trim() expects exactly two arguments.');
      }

      const regexText = String(argumentsValues[0]);
      const str = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      const startRegex = new RegExp(`^(?:${regexText})`);
      const endRegex = new RegExp(`(?:${regexText})$`);
      return str.replace(startRegex, '').replace(endRegex, '');
    }

    if (functionName === 'trim_start') {
      if (argumentsValues.length !== 2) {
        throw new Error('trim_start() expects exactly two arguments.');
      }

      const regexText = String(argumentsValues[0]);
      const str = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      return str.replace(new RegExp(`^(?:${regexText})`), '');
    }

    if (functionName === 'trim_end') {
      if (argumentsValues.length !== 2) {
        throw new Error('trim_end() expects exactly two arguments.');
      }

      const regexText = String(argumentsValues[0]);
      const str = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      return str.replace(new RegExp(`(?:${regexText})$`), '');
    }

    if (functionName === 'extract') {
      if (argumentsValues.length < 2 || argumentsValues.length > 3) {
        throw new Error('extract() expects two or three arguments.');
      }

      const regexText = String(argumentsValues[0]);
      const captureGroup = argumentsValues.length === 3 ? Number(argumentsValues[1]) : 1;
      const text = argumentsValues.length === 3
        ? (argumentsValues[2] === null || argumentsValues[2] === undefined ? '' : String(argumentsValues[2]))
        : (argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]));
      const match = new RegExp(regexText).exec(text);
      if (!match) {
        return '';
      }

      return match[captureGroup] ?? '';
    }

    if (functionName === 'indexof') {
      if (argumentsValues.length < 2 || argumentsValues.length > 4) {
        throw new Error('indexof() expects two to four arguments.');
      }

      const str = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      const lookup = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      const startIndex = argumentsValues.length >= 3 ? Number(argumentsValues[2]) : 0;
      return str.indexOf(lookup, Number.isFinite(startIndex) ? startIndex : 0);
    }

    if (functionName === 'replace_string') {
      if (argumentsValues.length !== 3) {
        throw new Error('replace_string() expects exactly three arguments.');
      }

      const str = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      const oldStr = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      const newStr = argumentsValues[2] === null || argumentsValues[2] === undefined ? '' : String(argumentsValues[2]);
      return str.replaceAll(oldStr, newStr);
    }

    if (functionName === 'parse_json') {
      if (argumentsValues.length !== 1) {
        throw new Error('parse_json() expects exactly one argument.');
      }

      const value = argumentsValues[0];
      if (value === null || value === undefined) {
        return null;
      }

      if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Date))) {
        return this.options.normalizeScalar(value);
      }

      const text = String(value).trim();
      if (text.length === 0) {
        return null;
      }

      try {
        return this.options.normalizeScalar(JSON.parse(text));
      } catch {
        return this.options.normalizeScalar(value);
      }
    }

    if (functionName === 'materialize') {
      if (argumentsValues.length !== 1) {
        throw new Error('materialize() expects exactly one argument.');
      }

      return this.options.normalizeScalar(argumentsValues[0]);
    }

    if (functionName === 'series_decompose_anomalies') {
      if (argumentsValues.length < 1 || argumentsValues.length > 3) {
        throw new Error('series_decompose_anomalies() expects one to three arguments.');
      }

      const series = argumentsValues[0];
      if (!Array.isArray(series)) {
        return null;
      }

      const numericSeries = series.map((value) => Number(value));
      const finiteValues = numericSeries.filter((value) => Number.isFinite(value));
      if (finiteValues.length === 0) {
        return series.map(() => 0);
      }

      const mean = finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
      const variance = finiteValues.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / finiteValues.length;
      const standardDeviation = Math.sqrt(variance);
      const zThreshold = argumentsValues.length >= 2 && Number.isFinite(Number(argumentsValues[1]))
        ? Math.abs(Number(argumentsValues[1]))
        : 1.5;

      if (standardDeviation === 0) {
        return series.map(() => 0);
      }

      const anomalies = numericSeries.map((value) => {
        if (!Number.isFinite(value)) {
          return 0;
        }

        const zScore = (value - mean) / standardDeviation;
        return zScore > zThreshold ? 1 : 0;
      });

      return anomalies;
    }

    if (functionName === 'tostring') {
      if (argumentsValues.length !== 1) {
        throw new Error('tostring() expects exactly one argument.');
      }

      const val = argumentsValues[0];
      if (val === null || val === undefined) {
        return '';
      }

      if (Array.isArray(val) || (typeof val === 'object' && !(val instanceof Date))) {
        return JSON.stringify(val);
      }

      return String(val);
    }

    if (functionName === 'isempty' || functionName === 'isnotempty' || functionName === 'isnotnull' || functionName === 'isnull') {
      if (argumentsValues.length !== 1) {
        throw new Error(`${functionName}() expects exactly one argument.`);
      }

      const val = argumentsValues[0];
      if (functionName === 'isempty') {
        return val === null || val === undefined || val === '';
      }

      if (functionName === 'isnotempty') {
        return !(val === null || val === undefined || val === '');
      }

      const isNull = val === null || val === undefined;
      if (functionName === 'isnull') {
        return isNull;
      }

      return !isNull;
    }

    if (functionName === 'countof') {
      if (argumentsValues.length < 2 || argumentsValues.length > 3) {
        throw new Error('countof() expects two or three arguments.');
      }

      const str = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      const search = argumentsValues[1] === null || argumentsValues[1] === undefined ? '' : String(argumentsValues[1]);
      const kind = argumentsValues.length === 3 ? String(argumentsValues[2]).toLowerCase() : 'normal';
      if (kind === 'regex') {
        const regex = new RegExp(search, 'g');
        const matches = str.match(regex);
        return matches ? matches.length : 0;
      }

      if (search.length === 0) {
        return 0;
      }

      let count = 0;
      let pos = 0;
      while (true) {
        const idx = str.indexOf(search, pos);
        if (idx === -1) {
          break;
        }

        count++;
        pos = idx + 1;
      }

      return count;
    }

    if (functionName === 'reverse') {
      if (argumentsValues.length !== 1) {
        throw new Error('reverse() expects exactly one argument.');
      }

      const str = argumentsValues[0] === null || argumentsValues[0] === undefined ? '' : String(argumentsValues[0]);
      return [...str].reverse().join('');
    }

    if (functionName === 'toint' || functionName === 'tolong') {
      if (argumentsValues.length !== 1) {
        throw new Error(`${functionName}() expects exactly one argument.`);
      }

      const val = argumentsValues[0];
      if (val === null || val === undefined) {
        return null;
      }

      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!/^-?\d+$/.test(trimmed)) {
          return null;
        }

        const num = Number(trimmed);
        return Number.isFinite(num) ? num : null;
      }

      const num = Number(val);
      return Number.isFinite(num) ? Math.trunc(num) : null;
    }

    if (functionName === 'tobool') {
      if (argumentsValues.length !== 1) {
        throw new Error('tobool() expects exactly one argument.');
      }

      const val = argumentsValues[0];
      if (val === null || val === undefined) {
        return null;
      }

      if (typeof val === 'boolean') {
        return val;
      }

      const str = String(val).toLowerCase();
      if (str === 'true' || str === '1') {
        return true;
      }

      if (str === 'false' || str === '0') {
        return false;
      }

      return null;
    }

    if (functionName === 'coalesce') {
      for (const val of argumentsValues) {
        if (val !== null && val !== undefined && val !== '') {
          return val;
        }
      }

      return null;
    }

    if (functionName === 'now') {
      if (argumentsValues.length !== 0) {
        throw new Error('now() does not take arguments.');
      }

      return new Date().toISOString();
    }

    if (functionName === 'ago') {
      if (argumentsValues.length !== 1) {
        throw new Error('ago() expects exactly one argument.');
      }

      const timespanMilliseconds = this.toTimespanMilliseconds(argumentsValues[0]);
      if (timespanMilliseconds === null) {
        return null;
      }

      return new Date(Date.now() - timespanMilliseconds).toISOString();
    }

    if (
      functionName === 'year'
      || functionName === 'month'
      || functionName === 'day'
      || functionName === 'hour'
      || functionName === 'minute'
      || functionName === 'dayofweek'
    ) {
      if (argumentsValues.length !== 1) {
        throw new Error(`${functionName}() expects exactly one argument.`);
      }

      return this.evaluateDateComponentFunction(functionName, argumentsValues[0]);
    }

    throw new Error(`Unsupported function call: ${dotCompositeFunctionCallExpression.getText()}`);
  }

  private getSimpleFunctionCall(
    dotCompositeFunctionCallExpression: DotCompositeFunctionCallExpressionContext,
  ): { name: string; arguments: UnnamedExpressionContext[] } | null {
    const expression = dotCompositeFunctionCallExpression;

    if (expression.dotCompositeFunctionCallOperation().length > 0) {
      return null;
    }

    const functionCallExpression = expression.functionCallExpression();
    const countExpression = functionCallExpression.countExpression();
    if (countExpression) {
      const argument = countExpression.namedExpression()?.unnamedExpression();
      return {
        name: 'count',
        arguments: argument ? [argument] : [],
      };
    }

    const namedFunctionCall = functionCallExpression.namedFunctionCallExpression();
    if (!namedFunctionCall) {
      return null;
    }

    const argumentsExpressions = namedFunctionCall.argumentExpression().map((argumentExpression) => {
      if (argumentExpression.starExpression()) {
        throw new Error('Star arguments are not supported.');
      }

      const namedExpression = argumentExpression.namedExpression();
      if (!namedExpression) {
        throw new Error('Invalid function argument.');
      }

      return namedExpression.unnamedExpression();
    });

    return {
      name: namedFunctionCall.simpleNameReference().getText(),
      arguments: argumentsExpressions,
    };
  }

  private evaluateBinFunction(value: KustoScalar, roundTo: KustoScalar): KustoScalar {
    const numericValue = Number(value);
    const numericRoundTo = Number(roundTo);
    if (Number.isFinite(numericValue) && Number.isFinite(numericRoundTo) && numericRoundTo > 0) {
      return Math.floor(numericValue / numericRoundTo) * numericRoundTo;
    }

    const date = this.toDate(value);
    const stepMilliseconds = this.toTimespanMilliseconds(roundTo);
    if (date && stepMilliseconds !== null && stepMilliseconds > 0) {
      // Kusto datetime binning anchors on .NET's DateTime.MinValue (0001-01-01),
      // not unix epoch — this matters for periods that aren't divisors of 1 day,
      // e.g. `bin(datetime, 7d)` lands on Mondays, not Thursdays.
      const anchor = this.getDatetimeBinAnchorMilliseconds();
      const delta = date.getTime() - anchor;
      const binned = Math.floor(delta / stepMilliseconds) * stepMilliseconds + anchor;
      return new Date(binned).toISOString();
    }

    return null;
  }

  private evaluateDatetimeAddFunction(period: KustoScalar, amount: KustoScalar, datetimeValue: KustoScalar): KustoScalar {
    const periodText = String(period).toLowerCase();
    const numericAmount = Number(amount);
    const date = this.toDate(datetimeValue);
    if (!Number.isFinite(numericAmount) || !date) {
      return null;
    }

    const result = new Date(date.getTime());
    if (periodText === 'day' || periodText === 'days') {
      result.setUTCDate(result.getUTCDate() + numericAmount);
      return result.toISOString();
    }

    if (periodText === 'hour' || periodText === 'hours') {
      result.setUTCHours(result.getUTCHours() + numericAmount);
      return result.toISOString();
    }

    if (periodText === 'minute' || periodText === 'minutes') {
      result.setUTCMinutes(result.getUTCMinutes() + numericAmount);
      return result.toISOString();
    }

    if (periodText === 'second' || periodText === 'seconds') {
      result.setUTCSeconds(result.getUTCSeconds() + numericAmount);
      return result.toISOString();
    }

    if (periodText === 'month' || periodText === 'months') {
      result.setUTCMonth(result.getUTCMonth() + numericAmount);
      return result.toISOString();
    }

    if (periodText === 'year' || periodText === 'years') {
      result.setUTCFullYear(result.getUTCFullYear() + numericAmount);
      return result.toISOString();
    }

    return null;
  }

  private evaluateDatetimeDiffFunction(period: KustoScalar, left: KustoScalar, right: KustoScalar): KustoScalar {
    const periodText = String(period).toLowerCase();
    const leftDate = this.toDate(left);
    const rightDate = this.toDate(right);
    if (!leftDate || !rightDate) {
      return null;
    }

    if (periodText === 'year' || periodText === 'years') {
      return leftDate.getUTCFullYear() - rightDate.getUTCFullYear();
    }

    if (periodText === 'month' || periodText === 'months') {
      return ((leftDate.getUTCFullYear() - rightDate.getUTCFullYear()) * 12)
        + (leftDate.getUTCMonth() - rightDate.getUTCMonth());
    }

    const millisecondsPerSecond = 1_000;
    const millisecondsPerMinute = 60_000;
    const millisecondsPerHour = 3_600_000;
    const millisecondsPerDay = 86_400_000;
    const deltaMilliseconds = leftDate.getTime() - rightDate.getTime();

    if (periodText === 'day' || periodText === 'days') {
      return Math.trunc(deltaMilliseconds / millisecondsPerDay);
    }

    if (periodText === 'hour' || periodText === 'hours') {
      return Math.trunc(deltaMilliseconds / millisecondsPerHour);
    }

    if (periodText === 'minute' || periodText === 'minutes') {
      return Math.trunc(deltaMilliseconds / millisecondsPerMinute);
    }

    if (periodText === 'second' || periodText === 'seconds') {
      return Math.trunc(deltaMilliseconds / millisecondsPerSecond);
    }

    return null;
  }

  private evaluateRangeFunction(start: KustoScalar, stop: KustoScalar, step: KustoScalar): KustoScalar {
    const startValue = Number(start);
    const stopValue = Number(stop);
    const stepValue = Number(step);
    if (!Number.isFinite(startValue) || !Number.isFinite(stopValue) || !Number.isFinite(stepValue) || stepValue === 0) {
      const startDate = this.toDate(start);
      const stopDate = this.toDate(stop);
      const stepMilliseconds = this.toTimespanMilliseconds(step);
      if (!startDate || !stopDate || stepMilliseconds === null || stepMilliseconds === 0) {
        return null;
      }

      const values: string[] = [];
      if (stepMilliseconds > 0) {
        for (let value = startDate.getTime(); value <= stopDate.getTime(); value += stepMilliseconds) {
          values.push(new Date(value).toISOString());
        }
      } else {
        for (let value = startDate.getTime(); value >= stopDate.getTime(); value += stepMilliseconds) {
          values.push(new Date(value).toISOString());
        }
      }

      return values;
    }

    const values: number[] = [];
    if (stepValue > 0) {
      for (let value = startValue; value <= stopValue; value += stepValue) {
        values.push(value);
      }
    } else {
      for (let value = startValue; value >= stopValue; value += stepValue) {
        values.push(value);
      }
    }

    return values;
  }

  private evaluateToDoubleFunction(value: KustoScalar): KustoScalar {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private evaluateRoundFunction(value: KustoScalar, precisionValue?: KustoScalar): KustoScalar {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return null;
    }

    if (precisionValue === undefined) {
      return Math.round(numericValue);
    }

    const numericPrecision = Number(precisionValue);
    if (!Number.isFinite(numericPrecision)) {
      return null;
    }

    const precision = Math.trunc(numericPrecision);
    const factor = 10 ** precision;
    if (!Number.isFinite(factor) || factor === 0) {
      return null;
    }

    return Math.round(numericValue * factor) / factor;
  }

  private evaluateArrayLengthFunction(value: KustoScalar): KustoScalar {
    if (Array.isArray(value)) {
      return value.length;
    }

    return null;
  }

  private evaluateCaseFunction(argumentsValues: KustoScalar[]): KustoScalar {
    for (let index = 0; index < argumentsValues.length - 1; index += 2) {
      if (argumentsValues[index]) {
        return argumentsValues[index + 1];
      }
    }

    return argumentsValues[argumentsValues.length - 1];
  }

  private evaluateStartOfDayFunction(value: KustoScalar, offsetDaysValue?: KustoScalar): KustoScalar {
    const date = this.toDate(value);
    if (!date) {
      return null;
    }

    const offsetDays = offsetDaysValue === undefined ? 0 : Number(offsetDaysValue);
    if (!Number.isFinite(offsetDays)) {
      return null;
    }

    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    start.setUTCDate(start.getUTCDate() + Math.trunc(offsetDays));
    return start.toISOString();
  }

  private evaluateDateComponentFunction(functionName: string, value: KustoScalar): KustoScalar {
    const date = this.toDate(value);
    if (!date) {
      return null;
    }

    if (functionName === 'year') {
      return date.getUTCFullYear();
    }

    if (functionName === 'month') {
      return date.getUTCMonth() + 1;
    }

    if (functionName === 'day') {
      return date.getUTCDate();
    }

    if (functionName === 'hour') {
      return date.getUTCHours();
    }

    if (functionName === 'minute') {
      return date.getUTCMinutes();
    }

    if (functionName === 'dayofweek') {
      return date.getUTCDay();
    }

    return null;
  }

  private evaluateBinAtFunction(value: KustoScalar, binSize: KustoScalar, fixedPoint: KustoScalar): KustoScalar {
    const numericValue = Number(value);
    const numericBinSize = Number(binSize);
    const numericFixedPoint = Number(fixedPoint);
    if (
      Number.isFinite(numericValue)
      && Number.isFinite(numericBinSize)
      && numericBinSize > 0
      && Number.isFinite(numericFixedPoint)
    ) {
      const delta = numericValue - numericFixedPoint;
      return Math.floor(delta / numericBinSize) * numericBinSize + numericFixedPoint;
    }

    const dateValue = this.toDate(value);
    const fixedDate = this.toDate(fixedPoint);
    const stepMilliseconds = this.toTimespanMilliseconds(binSize);
    if (!dateValue || !fixedDate || stepMilliseconds === null || stepMilliseconds <= 0) {
      return null;
    }

    const delta = dateValue.getTime() - fixedDate.getTime();
    const binned = Math.floor(delta / stepMilliseconds) * stepMilliseconds + fixedDate.getTime();
    return new Date(binned).toISOString();
  }

  private evaluateAdditiveOperation(left: KustoScalar, right: KustoScalar, isPlus: boolean): KustoScalar {
    const leftDate = this.toDate(left);
    const rightDate = this.toDate(right);
    const leftTimespan = this.toTimespanMilliseconds(left);
    const rightTimespan = this.toTimespanMilliseconds(right);

    if (leftDate && rightTimespan !== null) {
      const result = leftDate.getTime() + (isPlus ? rightTimespan : -rightTimespan);
      return new Date(result).toISOString();
    }

    if (isPlus && rightDate && leftTimespan !== null) {
      const result = rightDate.getTime() + leftTimespan;
      return new Date(result).toISOString();
    }

    if (!isPlus && leftDate && rightDate) {
      return this.formatTimespanMilliseconds(leftDate.getTime() - rightDate.getTime());
    }

    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return isPlus ? leftNumber + rightNumber : leftNumber - rightNumber;
    }

    return null;
  }

  private formatTimespanMilliseconds(totalMilliseconds: number): string {
    const negative = totalMilliseconds < 0;
    const absoluteMs = Math.abs(totalMilliseconds);
    const days = Math.floor(absoluteMs / 86_400_000);
    const hours = Math.floor((absoluteMs % 86_400_000) / 3_600_000);
    const minutes = Math.floor((absoluteMs % 3_600_000) / 60_000);
    const seconds = Math.floor((absoluteMs % 60_000) / 1_000);
    const fractionalMs = absoluteMs % 1_000;

    const pad2 = (value: number): string => value.toString().padStart(2, '0');
    const sign = negative ? '-' : '';
    const dayPart = days > 0 ? `${days}.` : '';
    const fractionPart = fractionalMs > 0
      ? `.${fractionalMs.toString().padStart(3, '0')}0000`
      : '';

    return `${sign}${dayPart}${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}${fractionPart}`;
  }

  private compareScalars(left: KustoScalar, right: KustoScalar): number {
    if (typeof left === 'number' && typeof right === 'number') {
      if (Number.isFinite(left) && Number.isFinite(right)) {
        if (left === right) {
          return 0;
        }

        return left < right ? -1 : 1;
      }

      return this.options.compareValues(left, right);
    }

    if (this.looksLikeDatetime(left) || this.looksLikeDatetime(right)) {
      const leftDate = this.toDate(left);
      const rightDate = this.toDate(right);
      if (leftDate && rightDate) {
        const leftTime = leftDate.getTime();
        const rightTime = rightDate.getTime();
        if (leftTime === rightTime) {
          return 0;
        }

        return leftTime < rightTime ? -1 : 1;
      }
    }

    if (typeof left === 'string' && typeof right === 'string') {
      if (left === right) {
        return 0;
      }

      return left < right ? -1 : 1;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      if (left === right) {
        return 0;
      }

      return left ? 1 : -1;
    }

    return this.options.compareValues(left, right);
  }

  private looksLikeDatetime(value: KustoScalar): boolean {
    if (value instanceof Date) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const trimmed = value.trim();
    if (trimmed.toLowerCase().startsWith('datetime(')) {
      return true;
    }

    return /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(trimmed);
  }

  private toDate(value: KustoScalar): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const datetimeText = this.normalizeDatetimeText(this.extractDatetimeLiteralText(value));
    const parsed = new Date(datetimeText);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  private extractDatetimeLiteralText(value: string): string {
    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    if (!lower.startsWith('datetime(') || !trimmed.endsWith(')')) {
      return trimmed;
    }

    return trimmed.slice(9, -1).trim();
  }

  private normalizeDatetimeText(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return trimmed;
    }

    // Kusto datetime literals without timezone are UTC.
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
    if (hasTimezone) {
      return trimmed;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T00:00:00Z`;
    }

    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(trimmed)) {
      return `${trimmed.replace(' ', 'T')}Z`;
    }

    return trimmed;
  }

  private toTimespanMilliseconds(value: KustoScalar): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return null;
    }

    const unit = trimmed.slice(-1).toLowerCase();
    const amount = Number(trimmed.slice(0, -1));
    if (!Number.isFinite(amount)) {
      return null;
    }

    if (unit === 's') {
      return amount * 1_000;
    }

    if (unit === 'm') {
      return amount * 60_000;
    }

    if (unit === 'h') {
      return amount * 3_600_000;
    }

    if (unit === 'd') {
      return amount * 86_400_000;
    }

    return null;
  }

  private coerceDynamicContainer(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    const dynamicMatch = trimmed.match(/^dynamic\((.*)\)$/s);
    const candidate = dynamicMatch ? dynamicMatch[1].trim() : trimmed;

    if (!(candidate.startsWith('{') || candidate.startsWith('['))) {
      return value;
    }

    try {
      return JSON.parse(candidate);
    } catch {
      return value;
    }
  }

  private getDatetimeBinAnchorMilliseconds(): number {
    const anchor = new Date(0);
    anchor.setUTCFullYear(1, 0, 1);
    anchor.setUTCHours(0, 0, 0, 0);
    return anchor.getTime();
  }
}

/**
 * Extracts a simple function call (name + arguments) from an UnnamedExpressionContext
 * by traversing the expression tree down to DotCompositeFunctionCallExpressionContext.
 * Returns null if the expression is not a simple function call.
 */
export function tryExtractFunctionCall(
  unnamedExpression: UnnamedExpressionContext,
): { name: string; arguments: UnnamedExpressionContext[] } | null {
  const logicalOrExpression = unnamedExpression.logicalOrExpression();
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
  if (
    !relationalExpression
    || relationalExpression.LESSTHAN()
    || relationalExpression.GREATERTHAN()
    || relationalExpression.LESSTHAN_EQUAL()
    || relationalExpression.GREATERTHAN_EQUAL()
  ) {
    return null;
  }

  const additiveExpressions = relationalExpression.additiveExpression();
  if (additiveExpressions.length !== 1) {
    return null;
  }

  const additiveExpression = additiveExpressions[0];
  if (additiveExpression.additiveOperation().length > 0) {
    return null;
  }

  const multiplicativeExpression = additiveExpression.multiplicativeExpression();
  if (multiplicativeExpression.multiplicativeOperation().length > 0) {
    return null;
  }

  const stringOperatorExpression = multiplicativeExpression.stringOperatorExpression();
  if (stringOperatorExpression.stringStarOperatorExpression()) {
    return null;
  }

  const binary = stringOperatorExpression.stringBinaryOperatorExpression();
  if (!binary || binary.stringBinaryOperation()) {
    return null;
  }

  const invocationExpression = binary.invocationExpression();
  if (invocationExpression.PLUS() || invocationExpression.DASH()) {
    return null;
  }

  const functionCallOrPathExpression = invocationExpression.functionCallOrPathExpression();
  if (functionCallOrPathExpression.toTableExpression() || functionCallOrPathExpression.functionCallOrPathPathExpression()) {
    return null;
  }

  const root = functionCallOrPathExpression.functionCallOrPathRoot();
  if (!root || root.primaryExpression() || root.toScalarExpression()) {
    return null;
  }

  const dotFunctionCall = root.dotCompositeFunctionCallExpression();
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
      return null;
    }

    const namedExpression = argumentExpression.namedExpression();
    return namedExpression?.unnamedExpression() ?? null;
  });

  if (argumentsList.some((arg) => arg === null)) {
    return null;
  }

  return {
    name: namedFunctionCall.simpleNameReference().getText(),
    arguments: argumentsList as UnnamedExpressionContext[],
  };
}
