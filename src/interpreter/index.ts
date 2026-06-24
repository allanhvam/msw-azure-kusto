import * as antlr from 'antlr4ng';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KqlLexer } from '../parser/KqlLexer.js';
import {
  type AfterPipeOperatorContext,
  type DeclareQueryParametersStatementContext,
  KqlParser,
  type DataTableExpressionContext,
  type EntityExpressionContext,
  type ManagementCommandExpressionContext,
  type ManagementShowBodyContext,
  type NamedExpressionContext,
  type OrderedExpressionContext,
  type PipeExpressionContext,
  type SetStatementContext,
  type StatementContext,
  type ToScalarExpressionContext,
  type UnnamedExpressionContext,
} from '../parser/KqlParser.js';
import { KqlVisitor } from '../parser/KqlVisitor.js';
import { setRowIngestionTime } from './ingestion-time.js';
import { DEFAULT_DATABASE_NAME } from '../constants.js';
import {
  getAlias,
  isDescending,
  extractManagementCommandFields,
  getQueryStatementPipeExpression,
  getStatementPipeExpression,
  type QueryAstParserOptions,
} from './query-ast-parser.js';
import { executePipeExpression, applyOperators, type QueryAstExecutionHandlers, type ScanSpec } from './query-ast-executor.js';
import { SummarizeOperator } from './summarize-operator.js';
import { TabularOperators } from './tabular-operators.js';
import { ExpressionAstEvaluator } from './expression-ast-evaluator.js';
import type {
  KustoExecutionResult,
  KustoRow,
  KustoScalar,
  ExecutionContext,
} from './types.js';

export type { KustoExecutionResult, KustoRow, KustoScalar } from './types.js';

export type KustoInterpreterOptions = {
  databaseName?: string;
};

export type KustoExecuteOptions = {
  queryParameters?: Record<string, unknown>;
};

export class KustoInterpreter {
  private readonly tables = new Map<string, KustoRow[]>();
  private readonly schemas = new Map<string, string[]>();
  private readonly schemaTypes = new Map<string, Map<string, string>>();
  private readonly defaultDatabaseName: string | null;
  private readonly parserOptions: QueryAstParserOptions = {
    normalizeName: (name) => this.normalizeName(name),
  };
  private readonly summarizeOperator = new SummarizeOperator({
    evaluateUnnamedExpression: (unnamedExpression, row, executionContext) =>
      this.evaluateUnnamedExpression(unnamedExpression, row, executionContext),
    normalizeScalar: (value) => this.normalizeScalar(value),
    compareValues: (left, right) => this.compareValues(left, right),
  });
  private readonly tabularOperators = new TabularOperators({
    executePartitionSubquery: (groupRows, subExpressionOperators, executionContext) =>
      applyOperators(
        groupRows.map((row) => ({ ...row })),
        subExpressionOperators,
        this.buildQueryExecutionHandlers(executionContext),
        null,
      ),
  });
  private readonly expressionAstEvaluator = new ExpressionAstEvaluator({
    parseScalar: (text) => this.parseScalar(text),
    normalizeScalar: (value) => this.normalizeScalar(value),
    compareValues: (left, right) => this.compareValues(left, right),
    evaluateToScalarExpression: (toScalarExpression, executionContext) =>
      this.evaluateToScalarExpression(toScalarExpression, executionContext),
  });

  public constructor(options: KustoInterpreterOptions = {}) {
    this.defaultDatabaseName = options.databaseName ?? null;
  }

  private buildQueryExecutionHandlers(executionContext: ExecutionContext): QueryAstExecutionHandlers {
    return {
      parserOptions: this.parserOptions,
      resolveTableSource: (name) => this.getQuerySourceRows(name, executionContext),
      resolveDataTableSource: (expressionText) => this.createRowsFromDataTableText(expressionText),
      resolvePrintSource: (expressions) => this.createPrintRows(expressions, executionContext),
      resolveRangeSource: (columnName, fromExpression, toExpression, stepExpression) =>
        this.createRangeRows(columnName, fromExpression, toExpression, stepExpression, executionContext),
      applyTake: (rows, amountExpression) => this.applyTakeAst(rows, amountExpression, executionContext),
      applyWhere: (rows, predicateExpression) => this.applyWhereAst(rows, predicateExpression, executionContext),
      applyExtend: (rows, expressions) => this.applyExtendAst(rows, expressions, executionContext),
      applyProject: (rows, expressions) => this.applyProjectAst(rows, expressions, executionContext),
      applyProjectAway: (rows, columns) => this.applyProjectAwayAst(rows, columns),
      applyProjectRename: (rows, expressions) => this.applyProjectRenameAst(rows, expressions),
      applyCount: (rows) => this.applyCountAst(rows),
      applyDistinct: (rows, includeAllColumns, expressions) =>
        this.applyDistinctAst(rows, includeAllColumns, expressions, executionContext),
      applySort: (rows, expressions) => this.applySortAst(rows, expressions, executionContext),
      applyTop: (rows, amountExpression, by) => this.applyTopAst(rows, amountExpression, by, executionContext),
      applyMvExpand: (rows, expressions, limit) => this.applyMvExpandAst(rows, expressions, limit, executionContext),
      applyMvApply: (rows, expressions, limit, subExpressionOperators) =>
        this.applyMvApplyAst(rows, expressions, limit, subExpressionOperators, executionContext),
      applyMakeSeries: (rows, aggregations, on, fromExpression, toExpression, stepExpression, by) =>
        this.applyMakeSeriesAst(rows, aggregations, on, fromExpression, toExpression, stepExpression, by, executionContext),
      applySummarize: (rows, aggregations, by) => this.applySummarizeAst(rows, aggregations, by, executionContext),
      applyUnion: (rows, unionRows) => this.tabularOperators.applyUnion(rows, unionRows),
      applyPartition: (rows, byExpression, subExpressionOperators) =>
        this.applyPartitionAst(rows, byExpression, subExpressionOperators, executionContext),
      applyJoin: (rows, joinKind, rightRows, on) => this.tabularOperators.applyJoin(rows, joinKind, rightRows, on),
      applyLookup: (rows, lookupKind, rightRows, on) => this.tabularOperators.applyLookup(rows, lookupKind, rightRows, on),
      applyScan: (rows, spec) => this.applyScanAst(rows, spec, executionContext),
    };
  }

  private createExecutionContext(parameters?: Record<string, unknown>): ExecutionContext {
    return {
      bindings: this.normalizeQueryParameters(parameters),
      tableBindings: new Map(),
    };
  }

  public getTable(name: string): KustoRow[] {
    const tableName = this.normalizeName(name);
    const rows = this.tables.get(tableName) ?? [];
    return rows.map((row) => ({ ...row }));
  }

  public listTables(): string[] {
    return Array.from(this.tables.keys()).sort((left, right) => left.localeCompare(right));
  }

  public async execute(text: string, options: KustoExecuteOptions = {}): Promise<KustoExecutionResult> {
    const startedAt = Date.now();
    const command = text.trim();
    const lexer = new KqlLexer(antlr.CharStream.fromString(command));
    const tokens = new antlr.CommonTokenStream(lexer);
    const parser = new KqlParser(tokens);
    const top = parser.top();

    if (parser.numberOfSyntaxErrors > 0) {
      throw new Error('Invalid KQL statement.');
    }

    const statements = top.query().statement();
    if (statements.length === 1) {
      const pipeExpression = getStatementPipeExpression(statements[0]);
      return this.executeCommand(pipeExpression, command, startedAt, this.createExecutionContext(options.queryParameters));
    }

    return this.executeScriptStatements(statements, startedAt, command, options);
  }

  private async executeCommand(
    pipeExpression: PipeExpressionContext,
    rawCommand: string,
    startedAt: number,
    executionContext: ExecutionContext,
  ): Promise<KustoExecutionResult> {
    const managementCtx = pipeExpression.beforePipeExpression().managementCommandExpression();
    if (managementCtx) {
      const parsed = extractManagementCommandFields(managementCtx, rawCommand);
      const rows = await this.executeManagementCommand(parsed, managementCtx);
      return this.decorateManagementResult(parsed, rows, startedAt);
    }

    const rows = this.executePipeExpression(pipeExpression, rawCommand, executionContext);
    const columnTypes = this.getQueryResultColumnTypes(pipeExpression, rows);

    return {
      kind: 'query',
      rows,
      ...(columnTypes ? { columnTypes } : {}),
    };
  }

  private async executeScriptStatements(
    statements: StatementContext[],
    startedAt: number,
    rawCommand: string,
    options: KustoExecuteOptions,
  ): Promise<KustoExecutionResult> {
    const executionContext: ExecutionContext = this.createExecutionContext(options.queryParameters);
    const letBindings = executionContext.bindings;
    const letTableBindings = executionContext.tableBindings;
    let finalPipeExpression: PipeExpressionContext | null = null;

    for (const statement of statements) {
      const statementVisitor = new KqlVisitor<void>();
      statementVisitor.visitDeclareQueryParametersStatement = (ctx) => {
        this.executeDeclareQueryParametersStatement(ctx, letBindings);
      };
      statementVisitor.visitLetMaterializeDeclaration = (ctx) => {
        const name = ctx.identifierOrKeywordOrEscapedName().getText();
        const rows = this.executePipeExpression(ctx.pipeExpression(), null, executionContext).map((row) => ({ ...row }));
        letTableBindings.set(name, rows);
        delete letBindings[name];
      };
      statementVisitor.visitLetVariableDeclaration = (ctx) => {
        const name = ctx.identifierOrKeywordOrEscapedName().getText();
        const pipeExpression = ctx.expression().pipeExpression();
        const letRows = this.tryEvaluateLetTabularRows(pipeExpression, executionContext);
        if (letRows) {
          letTableBindings.set(name, letRows);
          delete letBindings[name];
          return;
        }
        const unnamedExpression = pipeExpression.beforePipeExpression().unnamedExpression();
        if (!unnamedExpression) {
          throw new Error('Unsupported let variable expression.');
        }
        const value = this.normalizeScalar(this.evaluateUnnamedExpression(unnamedExpression, letBindings, executionContext));
        letBindings[name] = value;
        letTableBindings.delete(name);
      };
      const throwUnsupportedLet = () => {
        throw new Error('Only let variable and materialize declarations are supported.');
      };
      statementVisitor.visitLetFunctionDeclaration = throwUnsupportedLet;
      statementVisitor.visitLetViewDeclaration = throwUnsupportedLet;
      statementVisitor.visitLetEntityGroupDeclaration = throwUnsupportedLet;
      statementVisitor.visitSetStatement = (ctx) => {
        this.executeSetStatement(ctx);
      };
      statementVisitor.visitQueryStatement = (ctx) => {
        if (finalPipeExpression !== null) {
          throw new Error('Only one query statement is supported after let/set statements.');
        }
        finalPipeExpression = getQueryStatementPipeExpression(ctx);
      };
      const throwUnsupportedStatement = () => {
        throw new Error('Only declare query_parameters, let, set, and query statements are supported.');
      };
      statementVisitor.visitAliasDatabaseStatement = throwUnsupportedStatement;
      statementVisitor.visitDeclarePatternStatement = throwUnsupportedStatement;
      statementVisitor.visitRestrictAccessStatement = throwUnsupportedStatement;
      statementVisitor.visit(statement);
    }

    if (!finalPipeExpression) {
      return {
        kind: 'management',
        rows: [],
      };
    }

    return this.executeCommand(finalPipeExpression, rawCommand, startedAt, executionContext);
  }

  private executeDeclareQueryParametersStatement(
    declareStatement: DeclareQueryParametersStatementContext,
    letBindings: KustoRow,
  ): void {
    for (const parameter of declareStatement.declareQueryParametersStatementParameter()) {
      const parameterName = parameter.parameterName().getText();
      if (Object.hasOwn(letBindings, parameterName)) {
        continue;
      }

      const defaultValue = parameter.scalarParameterDefault()?.literalExpression();
      if (!defaultValue) {
        continue;
      }

      letBindings[parameterName] = this.parseScalar(defaultValue.getText());
    }
  }

  private normalizeQueryParameters(parameters?: Record<string, unknown>): KustoRow {
    if (!parameters) {
      return {};
    }

    const bindings: KustoRow = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string') {
        bindings[key] = this.parseScalar(value);
        continue;
      }

      bindings[key] = this.normalizeScalar(value);
    }

    return bindings;
  }

  private decorateManagementResult(
    parsed: ReturnType<typeof extractManagementCommandFields>,
    rows: KustoRow[],
    startedAt: number,
  ): KustoExecutionResult {
    if (this.defaultDatabaseName === null) {
      return { kind: 'management', rows };
    }

    const durationMs = Math.round((Date.now() - startedAt) / 50) * 50;

    if ((parsed.commandName === 'create' || parsed.commandName === 'alter') && parsed.tableName && parsed.schemaText !== null) {
      const tableName = this.normalizeName(parsed.tableName);
      return {
        kind: 'management',
        rows: [
          {
            TableName: tableName,
            Schema: JSON.stringify({ Name: tableName, OrderedColumns: this.toOrderedColumns(parsed.schemaText) }),
            DatabaseName: this.defaultDatabaseName,
            Folder: null,
            DocString: null,
          },
        ],
      };
    }

    if (parsed.commandName === 'create-or-alter' && parsed.tableName) {
      const [firstToken, secondToken, thirdToken] = parsed.argumentTokens;
      if (firstToken === 'ingestion' && secondToken === 'json' && thirdToken === 'mapping') {
        const tableName = this.normalizeName(parsed.tableName);
        const mappingMatch = parsed.command.match(/\bmapping\s+'([^']+)'\s+'([\s\S]*)'\s*$/i);
        if (mappingMatch) {
          const mappingName = mappingMatch[1];
          const mappingText = mappingMatch[2];

          let normalizedMapping = mappingText;
          try {
            const mappingParsed = JSON.parse(mappingText) as unknown;
            if (Array.isArray(mappingParsed)) {
              normalizedMapping = JSON.stringify(mappingParsed.map((entry) => {
                const item = (entry ?? {}) as Record<string, unknown>;
                const properties = item.Properties as Record<string, unknown> | undefined;
                const column = typeof item.column === 'string'
                  ? item.column
                  : typeof item.Column === 'string'
                    ? item.Column
                    : '';
                const datatype = typeof item.datatype === 'string'
                  ? item.datatype
                  : typeof item.DataType === 'string'
                    ? item.DataType
                    : typeof item.Type === 'string'
                      ? item.Type
                      : 'string';
                const path = typeof item.path === 'string'
                  ? item.path
                  : typeof item.Path === 'string'
                    ? item.Path
                    : typeof properties?.Path === 'string'
                      ? properties.Path
                      : typeof properties?.path === 'string'
                        ? properties.path
                        : '';

                return {
                  column,
                  path,
                  datatype: datatype.toLowerCase(),
                };
              }));
            }
          } catch {
            normalizedMapping = mappingText;
          }

          return {
            kind: 'management',
            rows: [
              {
                Name: mappingName,
                Kind: 'Json',
                Mapping: normalizedMapping,
                LastUpdatedOn: '2026-03-09T13:24:20.320Z',
                Database: this.defaultDatabaseName,
                Table: tableName,
              },
            ],
          };
        }
      }
    }

    if (parsed.commandName === 'ingest' && parsed.tableName && parsed.fromQueryPayload !== null) {
      const ingestKind = parsed.argumentTokens[0];
      if (ingestKind === 'inline' || ingestKind === 'uri') {
        const tableName = this.normalizeName(parsed.tableName);
        const payload = parsed.fromQueryPayload.trim();
        return {
          kind: 'management',
          rows: [
            {
              ExtentId: this.createDeterministicUuid(`extent:${tableName}:${payload}`),
              ItemLoaded: `inproc:${this.createDeterministicUuid(`item:${tableName}:${payload}`)}`,
              Duration: this.createTimespan(durationMs),
              HasErrors: false,
              OperationId: this.createDeterministicUuid(`operation:${tableName}:${payload}`),
            },
          ],
          columnTypes: {
            ExtentId: 'guid',
            Duration: 'timespan',
            OperationId: 'guid',
          },
        };
      }
    }

    if (parsed.commandName === 'drop') {
      return {
        kind: 'management',
        rows: this.listTables().map((name) => ({
          TableName: name,
          DatabaseName: this.defaultDatabaseName,
          Folder: null,
          DocString: null,
        })),
      };
    }

    return { kind: 'management', rows };
  }

  private tryEvaluateLetTabularRows(
    pipeExpression: PipeExpressionContext,
    executionContext: ExecutionContext,
  ): KustoRow[] | null {
    const materializedRows = this.tryEvaluateLetMaterializeRows(pipeExpression, executionContext);
    if (materializedRows) {
      return materializedRows;
    }

    const dataTableRows = this.tryEvaluateLetDataTableRows(pipeExpression);
    if (dataTableRows) {
      return dataTableRows;
    }

    if (!this.isTabularLetExpression(pipeExpression, executionContext.tableBindings)) {
      return null;
    }

    const rows = this.executePipeExpression(pipeExpression, null, executionContext);
    return rows.map((row) => ({ ...row }));
  }

  private isTabularLetExpression(
    pipeExpression: PipeExpressionContext,
    letTableBindings: Map<string, KustoRow[]>,
  ): boolean {
    if (pipeExpression.pipedOperator().length > 0) {
      return true;
    }

    const beforeExpression = pipeExpression.beforePipeExpression();
    if (beforeExpression.rangeExpression() || beforeExpression.printOperator()) {
      return true;
    }

    const rootUnionOperator = beforeExpression.beforeOrAfterPipeOperator()?.unionOperator();
    if (rootUnionOperator) {
      return true;
    }

    const sourceExpression = beforeExpression.unnamedExpression();
    if (!sourceExpression) {
      return false;
    }

    if (this.tryParseDataTableExpression(sourceExpression.getText())) {
      return true;
    }

    const materializeBody = this.extractMaterializeBody(sourceExpression.getText());
    if (materializeBody !== null) {
      return true;
    }

    const sourceName = this.normalizeName(sourceExpression.getText());
    return letTableBindings.has(sourceName) || this.tables.has(sourceName);
  }

  private tryEvaluateLetMaterializeRows(
    pipeExpression: PipeExpressionContext,
    executionContext: ExecutionContext,
  ): KustoRow[] | null {
    if (pipeExpression.pipedOperator().length > 0) {
      return null;
    }

    const sourceExpression = pipeExpression.beforePipeExpression().unnamedExpression();
    if (!sourceExpression) {
      return null;
    }

    const materializeBody = this.extractMaterializeBody(sourceExpression.getText());
    if (materializeBody === null) {
      return null;
    }

    const materializedPipeExpression = this.tryParseStandalonePipeExpression(materializeBody);
    if (!materializedPipeExpression) {
      throw new Error('Unsupported materialize() tabular expression in let assignment.');
    }

    const rows = this.executePipeExpression(materializedPipeExpression, null, executionContext);
    return rows.map((row) => ({ ...row }));
  }

  private tryParseStandalonePipeExpression(expressionText: string): PipeExpressionContext | null {
    const text = expressionText.trim();
    if (text.length === 0) {
      return null;
    }

    const lexer = new KqlLexer(antlr.CharStream.fromString(text));
    const tokens = new antlr.CommonTokenStream(lexer);
    const parser = new KqlParser(tokens);
    const top = parser.top();
    if (parser.numberOfSyntaxErrors > 0) {
      return null;
    }

    const statements = top.query().statement();
    if (statements.length !== 1) {
      return null;
    }

    const statement = statements[0];
    if (statement.letStatement() || statement.setStatement()) {
      return null;
    }

    const queryStatement = statement.queryStatement();
    if (!queryStatement) {
      return null;
    }

    return queryStatement.expression().pipeExpression();
  }

  private extractMaterializeBody(expressionText: string): string | null {
    const text = expressionText.trim();
    if (!text.toLowerCase().startsWith('materialize(')) {
      return null;
    }

    const firstParenIndex = text.indexOf('(');
    if (firstParenIndex < 0) {
      return null;
    }

    let depth = 0;
    let quote: '"' | '\'' | null = null;
    let escape = false;
    let closingParenIndex = -1;

    for (let index = firstParenIndex; index < text.length; index += 1) {
      const char = text[index];

      if (quote !== null) {
        if (escape) {
          escape = false;
          continue;
        }

        if (char === '\\') {
          escape = true;
          continue;
        }

        if (char === quote) {
          quote = null;
        }

        continue;
      }

      if (char === '"' || char === '\'') {
        quote = char;
        continue;
      }

      if (char === '(') {
        depth += 1;
        continue;
      }

      if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          closingParenIndex = index;
          break;
        }

        if (depth < 0) {
          return null;
        }
      }
    }

    if (depth !== 0 || closingParenIndex <= firstParenIndex) {
      return null;
    }

    if (closingParenIndex !== text.length - 1) {
      return null;
    }

    return text.slice(firstParenIndex + 1, closingParenIndex).trim();
  }

  private tryEvaluateLetDataTableRows(pipeExpression: PipeExpressionContext): KustoRow[] | null {
    if (pipeExpression.pipedOperator().length > 0) {
      return null;
    }

    const sourceExpression = pipeExpression.beforePipeExpression().unnamedExpression();
    if (!sourceExpression) {
      return null;
    }

    const dataTableExpression = this.tryParseDataTableExpression(sourceExpression.getText());
    if (!dataTableExpression) {
      return null;
    }

    return this.createRowsFromDataTableExpression(dataTableExpression);
  }

  private tryParseDataTableExpression(text: string): DataTableExpressionContext | null {
    const expressionText = text.trim();
    if (!expressionText.toLowerCase().startsWith('datatable')) {
      return null;
    }

    const lexer = new KqlLexer(antlr.CharStream.fromString(expressionText));
    const tokens = new antlr.CommonTokenStream(lexer);
    const parser = new KqlParser(tokens);
    const primaryExpression = parser.primaryExpression();

    if (parser.numberOfSyntaxErrors > 0) {
      return null;
    }

    return primaryExpression.dataTableExpression();
  }

  private createRowsFromDataTableExpression(dataTableExpression: DataTableExpressionContext): KustoRow[] {
    const columns = dataTableExpression
      .rowSchema()
      .rowSchemaColumnDeclaration()
      .map((column) => column.parameterName().getText());

    const values = dataTableExpression
      .literalExpression()
      .map((literal) => this.normalizeScalar(this.parseScalar(literal.getText())));

    if (columns.length === 0) {
      return [];
    }

    const rows: KustoRow[] = [];
    for (let index = 0; index < values.length; index += columns.length) {
      const row: KustoRow = {};
      for (let offset = 0; offset < columns.length; offset += 1) {
        const columnName = columns[offset];
        row[columnName] = values[index + offset] ?? null;
      }

      rows.push(row);
    }

    return rows;
  }

  private createRowsFromDataTableText(expressionText: string): KustoRow[] {
    const dataTableExpression = this.tryParseDataTableExpression(expressionText);
    if (!dataTableExpression) {
      throw new Error(`Unsupported datatable expression: ${expressionText}`);
    }

    return this.createRowsFromDataTableExpression(dataTableExpression);
  }

  private getQueryResultColumnTypes(pipeExpression: PipeExpressionContext, rows: KustoRow[]): Record<string, string> | undefined {
    const sourceTypes = this.getQuerySourceColumnTypes(pipeExpression);
    if (!sourceTypes) {
      return undefined;
    }

    const columnNames = rows.length > 0
      ? Object.keys(rows[0])
      : Array.from(sourceTypes.keys());

    const columnTypes: Record<string, string> = {};
    for (const columnName of columnNames) {
      const sourceType = sourceTypes.get(columnName);
      if (!sourceType) {
        continue;
      }

      if (!this.isColumnCompatibleWithType(rows, columnName, sourceType)) {
        continue;
      }

      columnTypes[columnName] = sourceType;
    }

    if (Object.keys(columnTypes).length === 0) {
      return undefined;
    }

    return columnTypes;
  }

  private isColumnCompatibleWithType(rows: KustoRow[], columnName: string, sourceType: string): boolean {
    for (const row of rows) {
      const value = row[columnName];
      if (value === null || value === undefined) {
        continue;
      }

      return this.isValueCompatibleWithType(value, sourceType);
    }

    return true;
  }

  private isValueCompatibleWithType(value: KustoScalar, sourceType: string): boolean {
    switch (this.normalizeScalarTypeName(sourceType)) {
      case 'datetime':
        if (value instanceof Date) {
          return !Number.isNaN(value.getTime());
        }

        if (typeof value !== 'string') {
          return false;
        }

        return !Number.isNaN(Date.parse(value));
      case 'bool':
        return typeof value === 'boolean';
      case 'int':
      case 'long':
      case 'real':
      case 'decimal':
        return typeof value === 'number';
      case 'dynamic':
        return true;
      case 'string':
      case 'guid':
      case 'timespan':
        return typeof value === 'string';
      default:
        return true;
    }
  }

  private getQuerySourceColumnTypes(pipeExpression: PipeExpressionContext): Map<string, string> | null {
    const sourceExpression = pipeExpression.beforePipeExpression().unnamedExpression();
    if (!sourceExpression) {
      return null;
    }

    const sourceText = sourceExpression.getText().trim();
    if (sourceText.toLowerCase().startsWith('datatable')) {
      return this.getDataTableColumnTypes(sourceText);
    }

    return this.schemaTypes.get(this.normalizeName(sourceText)) ?? null;
  }

  private getDataTableColumnTypes(expressionText: string): Map<string, string> | null {
    const dataTableExpression = this.tryParseDataTableExpression(expressionText);
    if (!dataTableExpression) {
      return null;
    }

    const types = new Map<string, string>();
    for (const declaration of dataTableExpression.rowSchema().rowSchemaColumnDeclaration()) {
      const columnName = declaration.parameterName().getText();
      const columnType = declaration.scalarType().getText().trim().toLowerCase();

      if (columnName.length === 0 || columnType.length === 0) {
        continue;
      }

      types.set(columnName, columnType);
    }

    return types;
  }

  private executeSetStatement(setStatement: SetStatementContext): void {
    setStatement.identifierOrKeywordName().getText();
    const optionValue = setStatement.setStatementOptionValue();
    if (!optionValue) {
      return;
    }

    const optionName = optionValue.identifierOrKeywordName();
    if (optionName) {
      optionName.getText();
      return;
    }

    const literal = optionValue.literalExpression();
    if (literal) {
      this.parseScalar(literal.getText());
    }
  }

  private executePipeExpression(
    pipeExpression: PipeExpressionContext,
    rawCommand: string | null,
    executionContext: ExecutionContext,
  ): KustoRow[] {
    return executePipeExpression(pipeExpression, rawCommand, this.buildQueryExecutionHandlers(executionContext));
  }

  private evaluateToScalarExpression(
    toScalarExpression: ToScalarExpressionContext,
    executionContext: ExecutionContext,
  ): KustoScalar {
    const pipeExpression = toScalarExpression.pipeExpression();
    const rows = this.executePipeExpression(pipeExpression, null, executionContext);
    if (rows.length === 0) {
      return null;
    }

    const firstRow = rows[0];
    const firstColumnName = Object.keys(firstRow)[0];
    if (!firstColumnName) {
      return null;
    }

    return this.normalizeScalar(firstRow[firstColumnName]);
  }

  private async executeManagementCommand(
    parsed: ReturnType<typeof extractManagementCommandFields>,
    managementCtx: ManagementCommandExpressionContext,
  ): Promise<KustoRow[]> {
    const command = parsed.command;

    const body = managementCtx.managementCommandBody();
    if (!body) {
      throw new Error(`Unsupported management command: ${command}`);
    }

    class ManagementCommandVisitor extends KqlVisitor<Promise<KustoRow[]>> {
      protected override defaultResult(): Promise<KustoRow[]> {
        throw new Error(`Unsupported management command: ${command}`);
      }
    }

    const visitor = new ManagementCommandVisitor();

    visitor.visitManagementTableWithSchemaBody = async () => {
      if ((parsed.commandName !== 'create' && parsed.commandName !== 'alter') || !parsed.tableName || parsed.schemaText === null) {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const tableName = this.normalizeName(parsed.tableName);
      const parsedSchema = this.parseSchemaDefinition(parsed.schemaText);
      const columns = parsedSchema.columns;

      this.schemas.set(tableName, columns);
      this.schemaTypes.set(tableName, parsedSchema.types);
      if (!this.tables.has(tableName)) {
        this.tables.set(tableName, []);
      }

      return [{ Status: parsed.commandName === 'create' ? 'TableCreated' : 'TableAltered', Table: tableName }];
    };

    visitor.visitManagementTableTargetBody = async () => {
      if (parsed.commandName !== 'create-or-alter' || !parsed.tableName) {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const [firstToken, secondToken, thirdToken] = parsed.argumentTokens;
      if (firstToken !== 'ingestion' || secondToken !== 'json' || thirdToken !== 'mapping') {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const tableName = this.normalizeName(parsed.tableName);
      if (!this.tables.has(tableName)) {
        this.tables.set(tableName, []);
      }

      return [{ Status: 'MappingCreatedOrAltered', Table: tableName }];
    };

    visitor.visitManagementShowBody = (ctx: ManagementShowBodyContext) => {
      if (parsed.commandName !== 'show') {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const target = ctx.getText().toLowerCase();
      if (target === 'tables') {
        const databaseName = this.defaultDatabaseName ?? DEFAULT_DATABASE_NAME;
        return Promise.resolve(Array.from(this.tables.keys())
          .sort((left, right) => left.localeCompare(right))
          .map((tableName) => ({ TableName: tableName, DatabaseName: databaseName })));
      }

      if (target === 'database') {
        return Promise.resolve([{ DatabaseName: this.defaultDatabaseName ?? DEFAULT_DATABASE_NAME }]);
      }

      throw new Error(`Unsupported management command: ${command}`);
    };

    visitor.visitManagementDropTableBody = async () => {
      if (parsed.commandName !== 'drop' || !parsed.tableName) {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const tableName = this.normalizeName(parsed.tableName);
      const ifexists = parsed.argumentTokens.length === 1 && parsed.argumentTokens[0] === 'ifexists';
      if (parsed.argumentTokens.length > 0 && !ifexists) {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const existed = this.tables.delete(tableName);
      this.schemas.delete(tableName);
      this.schemaTypes.delete(tableName);

      if (!existed && !ifexists) {
        throw new Error(`Table does not exist: ${tableName}`);
      }

      return [{ Status: existed ? 'TableDropped' : 'TableNotFound', Table: tableName }];
    };

    const ingestWithKind = async (expectedKind: 'inline' | 'uri'): Promise<KustoRow[]> => {
      if (parsed.commandName !== 'ingest' || !parsed.tableName || parsed.fromQueryPayload === null) {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const ingestKind = parsed.argumentTokens[0];
      if (ingestKind !== expectedKind) {
        throw new Error(`Unsupported management command: ${command}`);
      }

      const tableName = this.normalizeName(parsed.tableName);
      const payload = parsed.fromQueryPayload.trim();
      const ingestOptions = this.parseIngestOptions(parsed.argumentsText);
      const ingested = ingestKind === 'inline'
        ? this.parseInlineRows(tableName, payload)
        : await this.parseUriRows(tableName, payload, ingestOptions);
      const existing = this.tables.get(tableName) ?? [];
      this.tables.set(tableName, [...existing, ...ingested]);

      if (!this.schemas.has(tableName) && ingested.length > 0) {
        this.schemas.set(tableName, Object.keys(ingested[0]));
      }

      return [{ Status: 'Ingested', Table: tableName, Count: ingested.length }];
    };

    visitor.visitManagementIngestInlineBody = async () => ingestWithKind('inline');
    visitor.visitManagementIngestFromUriBody = async () => ingestWithKind('uri');

    const concreteBody = body.managementTableWithSchemaBody()
      ?? body.managementTableTargetBody()
      ?? body.managementDropTableBody()
      ?? body.managementShowBody()
      ?? body.managementIngestInlineBody()
      ?? body.managementIngestFromUriBody()
      ?? body.managementGenericBody();
    if (!concreteBody) {
      throw new Error(`Unsupported management command: ${command}`);
    }

    const rows = await visitor.visit(concreteBody);
    if (!rows) {
      throw new Error(`Unsupported management command: ${command}`);
    }

    return rows;
  }

  private parseIngestOptions(argumentsText: string): { ignoreFirstRecord: boolean } {
    const properties = this.parseWithClauseProperties(argumentsText);
    const ignoreFirstRecord = this.parseBooleanProperty(properties.get('ignorefirstrecord'), false);

    return {
      ignoreFirstRecord,
    };
  }

  private parseWithClauseProperties(text: string): Map<string, string> {
    const withMatch = text.match(/\bwith\s*\(([\s\S]*)\)\s*$/i);
    if (!withMatch) {
      return new Map<string, string>();
    }

    return this.parsePropertyAssignments(withMatch[1]);
  }

  private parsePropertyAssignments(text: string): Map<string, string> {
    const assignments = new Map<string, string>();
    let current = '';
    let quote: '"' | '\'' | null = null;

    const pushAssignment = (entry: string) => {
      const equalsIndex = entry.indexOf('=');
      if (equalsIndex <= 0) {
        return;
      }

      const key = entry.slice(0, equalsIndex).trim().toLowerCase();
      const value = entry.slice(equalsIndex + 1).trim();
      if (key.length === 0 || value.length === 0) {
        return;
      }

      assignments.set(key, value);
    };

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];

      if ((char === '"' || char === '\'') && quote === null) {
        quote = char;
        current += char;
        continue;
      }

      if (quote !== null && char === quote) {
        quote = null;
        current += char;
        continue;
      }

      if (char === ',' && quote === null) {
        pushAssignment(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    pushAssignment(current.trim());

    return assignments;
  }

  private parseBooleanProperty(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined) {
      return fallback;
    }

    const normalized = value.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }

    return fallback;
  }

  private parseSchemaDefinition(schemaText: string): { columns: string[]; types: Map<string, string> } {
    const entries = schemaText
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => {
        const [namePart, typePart] = item.split(':');
        return {
          name: (namePart ?? '').trim(),
          type: (typePart ?? 'string').trim().toLowerCase(),
        };
      })
      .filter((entry) => entry.name.length > 0);

    const types = new Map<string, string>();
    for (const entry of entries) {
      types.set(entry.name, entry.type);
    }

    return {
      columns: entries.map((entry) => entry.name),
      types,
    };
  }

  private convertIngestValue(tableName: string, column: string, value: unknown): unknown {
    const type = this.normalizeScalarTypeName(this.schemaTypes.get(tableName)?.get(column)?.toLowerCase() ?? '');

    if (value === null || value === undefined) {
      if (type === 'string') {
        return '';
      }

      return null;
    }

    if (type === 'dynamic') {
      return this.parseDynamicValue(value);
    }

    if (type !== 'datetime') {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    const parsedDate = this.parseDateValue(value);
    return parsedDate ?? null;
  }

  private parseDateValue(value: unknown): Date | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(?:\.(\d{1,7}))?$/);
    if (match) {
      const fractional = (match[3] ?? '0').padEnd(7, '0');
      const milliseconds = fractional.slice(0, 3);
      const iso = `${match[1]}T${match[2]}.${milliseconds}Z`;
      const parsed = new Date(iso);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const fallback = new Date(trimmed);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }

    return null;
  }

  private parseDynamicValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  private async parseUriRows(
    tableName: string,
    sourceText: string,
    options: { ignoreFirstRecord: boolean },
  ): Promise<KustoRow[]> {
    const uri = sourceText.trim().replace(/^['"]|['"]$/g, '');
    const csvText = await this.loadCsvFromSource(uri, sourceText);
    const csvRows = this.parseCsvText(csvText);
    if (csvRows.length === 0) {
      return [];
    }
    const schema = this.schemas.get(tableName);
    const hasSchema = Boolean(schema);
    const headerRow = csvRows[0];
    const dataRows = hasSchema
      ? (options.ignoreFirstRecord ? csvRows.slice(1) : csvRows)
      : csvRows.slice(1);
    const columns = (schema ?? headerRow.map((column) => column.replace(/^\uFEFF/, '').trim()));

    const headerMap = new Map<string, number>();
    if (!hasSchema) {
      for (let index = 0; index < headerRow.length; index += 1) {
        const key = headerRow[index].replace(/^\uFEFF/, '').trim().toLowerCase();
        if (key.length > 0 && !headerMap.has(key)) {
          headerMap.set(key, index);
        }
      }
    }

    const ingestionTime = new Date().toISOString();

    return dataRows.map((cells) => {
      const values = columns.map((column, index) => {
        const mappedIndex = hasSchema ? index : (headerMap.get(column.toLowerCase()) ?? index);
        const rawCell = (cells[mappedIndex] ?? '').trim();
        if (rawCell.length === 0) {
          return this.convertIngestValue(tableName, column, null);
        }

        return this.convertIngestValue(tableName, column, this.parseScalar(rawCell));
      });

      return this.toRow(columns, values, ingestionTime);
    });
  }

  private async loadCsvFromSource(uri: string, sourceText: string): Promise<string> {
    if (/^https?:\/\//i.test(uri)) {
      const cacheDir = join(process.cwd(), '.cache', 'kusto-ingest');
      mkdirSync(cacheDir, { recursive: true });

      const cacheKey = createHash('sha256').update(uri).digest('hex');
      const cachePath = join(cacheDir, `${cacheKey}.csv`);
      if (existsSync(cachePath)) {
        console.log(`[kusto] ingest cache hit for ${uri}`);
        return readFileSync(cachePath, 'utf8');
      }

      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Could not download ingest source: ${sourceText}`);
      }

      const totalBytes = Number(response.headers.get('content-length') ?? 0);
      const reader = response.body?.getReader();

      if (!reader) {
        const text = await response.text();
        writeFileSync(cachePath, text, 'utf8');
        return text;
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      let lastLoggedProgress = -10;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        chunks.push(value);
        receivedBytes += value.byteLength;

        if (totalBytes > 0) {
          const progress = Math.floor((receivedBytes * 100) / totalBytes);
          if (progress >= lastLoggedProgress + 10) {
            lastLoggedProgress = progress;
            console.log(`[kusto] ingest download ${progress}% (${receivedBytes}/${totalBytes} bytes)`);
          }
        } else if (receivedBytes >= (lastLoggedProgress + 10) * 1024) {
          lastLoggedProgress += 10;
          console.log(`[kusto] ingest downloaded ${receivedBytes} bytes`);
        }
      }

      const combined = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.byteLength;
      }

      const text = new TextDecoder().decode(combined);
      writeFileSync(cachePath, text, 'utf8');
      console.log(`[kusto] ingest cached source at ${cachePath}`);

      return text;
    }

    if (uri.startsWith('file://')) {
      return readFileSync(new URL(uri), 'utf8');
    }

    if (uri.startsWith('data:')) {
      const commaIndex = uri.indexOf(',');
      if (commaIndex < 0) {
        throw new Error(`Unsupported ingest source: ${sourceText}`);
      }

      const metadata = uri.slice(5, commaIndex);
      const payload = uri.slice(commaIndex + 1);
      if (metadata.toLowerCase().includes(';base64')) {
        return Buffer.from(payload, 'base64').toString('utf8');
      }

      return decodeURIComponent(payload);
    }

    throw new Error(`Unsupported ingest source: ${sourceText}`);
  }

  private parseCsvText(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    let rowHasData = false;

    const finalizeRow = (includeExplicitEmpty: boolean = false) => {
      currentRow.push(currentCell);

      if (rowHasData || currentCell.length > 0 || includeExplicitEmpty) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentCell = '';
      rowHasData = false;
    };

    for (let index = 0; index < csvText.length; index += 1) {
      const char = csvText[index];

      if (char === '"') {
        rowHasData = true;
        const nextChar = csvText[index + 1];
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        rowHasData = true;
        currentRow.push(currentCell);
        currentCell = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && csvText[index + 1] === '\n') {
          index += 1;
        }

        const hasMoreContent = index < csvText.length - 1;
        finalizeRow(hasMoreContent);
        continue;
      }

      rowHasData = true;
      currentCell += char;
    }

    finalizeRow();

    return rows;
  }

  private parseInlineRows(tableName: string, payload: string): KustoRow[] {
    const lines = payload
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const schema = this.schemas.get(tableName);

    if (lines.length === 0) {
      return [];
    }

    const ingestionTime = new Date().toISOString();

    return lines.map((line, lineIndex) => {
      if (line.startsWith('{') && line.endsWith('}')) {
        const parsed = JSON.parse(line) as Record<string, unknown>;
        const columns = schema ?? Object.keys(parsed);
        const values = columns.map((column) => this.convertIngestValue(tableName, column, parsed[column] ?? null));
        return this.toRow(columns, values, ingestionTime);
      }

      if (line.startsWith('[') && line.endsWith(']')) {
        const parsed = JSON.parse(line) as unknown[];
        const columns = schema ?? parsed.map((_, index) => `c${index + 1}`);
        const values = columns.map((column, index) => this.convertIngestValue(tableName, column, parsed[index] ?? null));
        return this.toRow(columns, values, ingestionTime);
      }

      const rawValues = line.split(',').map((token) => this.parseScalar(token.trim()));
      const columns = schema ?? rawValues.map((_, index) => `c${index + 1}`);
      const values = rawValues.map((value, index) => this.convertIngestValue(tableName, columns[index], value));

      if (lineIndex === 0 && !this.schemas.has(tableName)) {
        this.schemas.set(tableName, columns);
      }

      return this.toRow(columns, values, ingestionTime);
    });
  }

  private toRow(columns: string[], values: unknown[], ingestionTime: string | null = null): KustoRow {
    const row: KustoRow = {};

    for (let i = 0; i < columns.length; i += 1) {
      const value = values[i] ?? null;
      row[columns[i]] = this.normalizeScalar(value);
    }

    if (ingestionTime !== null) {
      setRowIngestionTime(row, ingestionTime);
    }

    return row;
  }

  private applyTakeAst(rows: KustoRow[], amountExpression: UnnamedExpressionContext, executionContext: ExecutionContext): KustoRow[] {
    const amountValue = this.evaluateUnnamedExpression(amountExpression, {}, executionContext);
    const amount = Number(amountValue);

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
      throw new Error(`Invalid take value: ${String(amountValue)}`);
    }

    return rows.slice(0, amount);
  }

  private applyWhereAst(rows: KustoRow[], predicateExpression: UnnamedExpressionContext, executionContext: ExecutionContext): KustoRow[] {
    return rows.filter((row) => Boolean(this.evaluateUnnamedExpression(predicateExpression, row, executionContext)));
  }

  private applyExtendAst(rows: KustoRow[], expressions: NamedExpressionContext[], executionContext: ExecutionContext): KustoRow[] {
    return rows.map((row) => {
      const next = { ...row };

      for (const expression of expressions) {
        const alias = getAlias(expression);
        if (!alias) {
          throw new Error(`Invalid extend expression: ${expression.unnamedExpression().getText()}`);
        }

        const value = this.evaluateUnnamedExpression(expression.unnamedExpression(), next, executionContext);
        if (Array.isArray(value)) {
          next[alias] = value;
        } else {
          next[alias] = this.normalizeScalar(value);
        }
      }

      return next;
    });
  }

  private applyProjectAst(rows: KustoRow[], expressions: NamedExpressionContext[], executionContext: ExecutionContext): KustoRow[] {
    return rows.map((row) => {
      const projected: KustoRow = {};

      for (const expression of expressions) {
        const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), row, executionContext));
        const name = getAlias(expression) ?? expression.unnamedExpression().getText();
        projected[name] = value;
      }

      return projected;
    });
  }

  private applyProjectAwayAst(rows: KustoRow[], columns: string[]): KustoRow[] {
    if (columns.length === 0) {
      return rows.map((row) => ({ ...row }));
    }

    return rows.map((row) => {
      const next = { ...row };
      for (const column of columns) {
        if (column.includes('*')) {
          const wildcardIndex = column.indexOf('*');
          const prefix = column.slice(0, wildcardIndex);
          for (const key of Object.keys(next)) {
            if (key.startsWith(prefix)) {
              delete next[key];
            }
          }

          continue;
        }

        delete next[column];
      }

      return next;
    });
  }

  private applyProjectRenameAst(rows: KustoRow[], expressions: NamedExpressionContext[]): KustoRow[] {
    return rows.map((row) => {
      const next = { ...row };
      for (const expression of expressions) {
        const alias = getAlias(expression);
        if (!alias) {
          throw new Error(`Invalid project-rename expression: ${expression.unnamedExpression().getText()}`);
        }

        const sourceName = expression.unnamedExpression().getText();
        const value = Object.hasOwn(next, sourceName) ? next[sourceName] : null;
        if (sourceName !== alias) {
          delete next[sourceName];
        }

        next[alias] = value;
      }

      return next;
    });
  }

  private applyCountAst(rows: KustoRow[]): KustoRow[] {
    return [{ Count: rows.length }];
  }

  private applyDistinctAst(
    rows: KustoRow[],
    includeAllColumns: boolean,
    expressions: NamedExpressionContext[],
    executionContext: ExecutionContext,
  ): KustoRow[] {
    const seen = new Set<string>();
    const distinctRows: KustoRow[] = [];

    for (const row of rows) {
      let projected: KustoRow;
      if (includeAllColumns) {
        projected = { ...row };
      } else {
        projected = {};
        for (const expression of expressions) {
          const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), row, executionContext));
          const name = getAlias(expression) ?? expression.unnamedExpression().getText();
          projected[name] = value;
        }
      }

      const key = JSON.stringify(projected);
      if (!seen.has(key)) {
        seen.add(key);
        distinctRows.push(projected);
      }
    }

    return distinctRows;
  }

  private applySortAst(rows: KustoRow[], expressions: OrderedExpressionContext[], executionContext: ExecutionContext): KustoRow[] {
    if (expressions.length === 0) {
      return rows;
    }

    const sorted = [...rows];
    sorted.sort((left, right) => {
      for (const expression of expressions) {
        const leftValue = this.evaluateUnnamedExpression(expression.namedExpression().unnamedExpression(), left, executionContext);
        const rightValue = this.evaluateUnnamedExpression(expression.namedExpression().unnamedExpression(), right, executionContext);

        const comparison = this.compareValues(leftValue, rightValue);
        if (comparison !== 0) {
          return isDescending(expression) ? -comparison : comparison;
        }
      }

      return 0;
    });

    return sorted;
  }

  private applyScanAst(rows: KustoRow[], spec: ScanSpec, executionContext: ExecutionContext): KustoRow[] {
    const declarations = spec.declarations.map((declaration) => {
      const defaultClause = declaration.scalarParameterDefault();
      return {
        name: declaration.parameterName().getText(),
        defaultValue: defaultClause ? this.evaluateScanDefault(defaultClause.literalExpression().getText()) : null,
      };
    });

    const declaredDefaults: KustoRow = {};
    for (const declaration of declarations) {
      declaredDefaults[declaration.name] = declaration.defaultValue;
    }
    const declaredNames = declarations.map((declaration) => declaration.name);

    const partitions = this.partitionScanRows(rows, spec.partitionBy, executionContext);

    const output: KustoRow[] = [];
    for (const partitionRows of partitions) {
      const ordered = spec.orderBy.length > 0
        ? this.applySortAst(partitionRows, spec.orderBy, executionContext)
        : partitionRows;
      output.push(...this.runScanStateMachine(ordered, spec, declaredNames, declaredDefaults, executionContext));
    }

    return output;
  }

  private evaluateScanDefault(text: string): KustoScalar {
    const typedNull = text.match(/^[A-Za-z_]\w*\(\s*(.*?)\s*\)$/s);
    if (typedNull) {
      const inner = typedNull[1].trim();
      if (inner === '' || /^null$/i.test(inner)) {
        return null;
      }

      return this.normalizeScalar(this.parseScalar(inner));
    }

    return this.normalizeScalar(this.parseScalar(text));
  }

  private partitionScanRows(
    rows: KustoRow[],
    partitionBy: UnnamedExpressionContext[],
    executionContext: ExecutionContext,
  ): KustoRow[][] {
    if (partitionBy.length === 0) {
      return [rows];
    }

    const groups = new Map<string, KustoRow[]>();
    const order: string[] = [];
    for (const row of rows) {
      const key = JSON.stringify(
        partitionBy.map((expression) => this.normalizeScalar(this.evaluateUnnamedExpression(expression, row, executionContext))),
      );
      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
        order.push(key);
      }
      group.push(row);
    }

    return order.map((key) => groups.get(key)!);
  }

  private runScanStateMachine(
    rows: KustoRow[],
    spec: ScanSpec,
    declaredNames: string[],
    declaredDefaults: KustoRow,
    executionContext: ExecutionContext,
  ): KustoRow[] {
    const stepCount = spec.steps.length;
    const stepStates: Array<KustoRow | null> = new Array(stepCount).fill(null);
    const pendingLast: Array<KustoRow | null> = new Array(stepCount).fill(null);
    const output: KustoRow[] = [];
    let matchId = 0;
    let matchStarted = false;

    for (const row of rows) {
      const originals = { ...row };

      for (let stepIndex = stepCount - 1; stepIndex >= 0; stepIndex -= 1) {
        const step = spec.steps[stepIndex];
        const selfActive = stepStates[stepIndex] !== null;
        const previousActive = stepIndex === 0 || stepStates[stepIndex - 1] !== null;
        if (!selfActive && !previousActive) {
          continue;
        }

        const evaluationRow: KustoRow = { ...originals };
        for (let index = 0; index < stepCount; index += 1) {
          evaluationRow[spec.steps[index].name] = stepStates[index] ?? declaredDefaults;
        }

        const source = selfActive
          ? stepStates[stepIndex]
          : (stepIndex > 0 ? stepStates[stepIndex - 1] : null);
        for (const name of declaredNames) {
          evaluationRow[name] = source && Object.hasOwn(source, name) ? source[name] : declaredDefaults[name];
        }

        if (!this.evaluateUnnamedExpression(step.condition, evaluationRow, executionContext)) {
          continue;
        }

        const newRow: KustoRow = { ...originals };
        for (const name of declaredNames) {
          newRow[name] = evaluationRow[name];
        }
        for (const assignment of step.assignments) {
          const value = this.evaluateUnnamedExpression(assignment.expression, evaluationRow, executionContext);
          const normalized = Array.isArray(value) ? value : this.normalizeScalar(value);
          newRow[assignment.name] = normalized;
          evaluationRow[assignment.name] = normalized;
        }

        const advanced = !selfActive && stepIndex > 0;
        const freshStart = stepIndex === 0 && !selfActive;
        if (freshStart) {
          if (matchStarted) {
            matchId += 1;
          }
          matchStarted = true;
        }

        if (spec.matchIdColumn) {
          newRow[spec.matchIdColumn] = matchId;
        }

        stepStates[stepIndex] = newRow;
        if (advanced) {
          const previousStep = spec.steps[stepIndex - 1];
          if (previousStep.output === 'last' && pendingLast[stepIndex - 1]) {
            output.push(pendingLast[stepIndex - 1]!);
            pendingLast[stepIndex - 1] = null;
          }
          stepStates[stepIndex - 1] = null;
        }

        if (step.output === 'all') {
          output.push(newRow);
        } else if (step.output === 'last') {
          pendingLast[stepIndex] = newRow;
        }

        break;
      }
    }

    for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
      if (spec.steps[stepIndex].output === 'last' && pendingLast[stepIndex]) {
        output.push(pendingLast[stepIndex]!);
      }
    }

    return output;
  }

  private applyTopAst(
    rows: KustoRow[],
    amountExpression: UnnamedExpressionContext,
    by: OrderedExpressionContext,
    executionContext: ExecutionContext,
  ): KustoRow[] {
    const amount = Number(this.evaluateUnnamedExpression(amountExpression, {}, executionContext));
    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
      throw new Error(`Invalid top value: ${String(amount)}`);
    }

    const sorted = this.applySortAst(rows, [by], executionContext);
    return sorted.slice(0, amount);
  }

  private applyMvExpandAst(
    rows: KustoRow[],
    expressions: NamedExpressionContext[],
    limit: number | null,
    executionContext: ExecutionContext,
  ): KustoRow[] {
    if (expressions.length === 0) {
      return rows;
    }

    let expandedRows = rows.map((row) => ({ ...row }));

    for (const expression of expressions) {
      const nextRows: KustoRow[] = [];
      for (const row of expandedRows) {
        const value = this.evaluateUnnamedExpression(expression.unnamedExpression(), row, executionContext);
        const columnName = getAlias(expression) ?? expression.unnamedExpression().getText();

        if (Array.isArray(value)) {
          const values = limit === null ? value : value.slice(0, limit);
          for (const item of values) {
            const next = { ...row };
            next[columnName] = this.normalizeScalar(item);
            nextRows.push(next);
          }
          continue;
        }

        if (value === null) {
          const next = { ...row };
          next[columnName] = null;
          nextRows.push(next);
          continue;
        }

        const next = { ...row };
        next[columnName] = this.normalizeScalar(value);
        nextRows.push(next);
      }

      expandedRows = nextRows;
    }

    return expandedRows;
  }

  private applyMvApplyAst(
    rows: KustoRow[],
    expressions: NamedExpressionContext[],
    limit: number | null,
    subExpressionOperators: AfterPipeOperatorContext[],
    executionContext: ExecutionContext,
  ): KustoRow[] {
    if (expressions.length === 0) {
      return rows;
    }

    const expandedColumns = new Set(
      expressions.map((expression) => getAlias(expression) ?? expression.unnamedExpression().getText()),
    );
    const handlers = this.buildQueryExecutionHandlers(executionContext);

    const output: KustoRow[] = [];
    for (const row of rows) {
      // Expand this source row's array column(s) into a subtable, then run the
      // on (...) subquery against it.
      const subtable = this.applyMvExpandAst([{ ...row }], expressions, limit, executionContext);
      const subResult = applyOperators(subtable, subExpressionOperators, handlers, null);

      // Re-attach the non-expanded source columns to each subquery result row,
      // restoring any that the subquery dropped (e.g. via summarize).
      for (const resultRow of subResult) {
        for (const [columnName, value] of Object.entries(row)) {
          if (!expandedColumns.has(columnName) && !Object.hasOwn(resultRow, columnName)) {
            resultRow[columnName] = value;
          }
        }
        output.push(resultRow);
      }
    }

    return output;
  }

  private applyMakeSeriesAst(
    rows: KustoRow[],
    aggregations: Array<{
      functionName: 'count' | 'sum' | 'avg' | 'min' | 'max';
      valueExpression: NamedExpressionContext | null;
      alias: string | null;
      defaultExpression: NamedExpressionContext | null;
    }>,
    on: NamedExpressionContext,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
    by: NamedExpressionContext[],
    executionContext: ExecutionContext,
  ): KustoRow[] {
    if (aggregations.length === 0) {
      throw new Error('make-series requires at least one aggregation.');
    }

    const fromValue = this.normalizeScalar(this.evaluateUnnamedExpression(fromExpression, {}, executionContext));
    const toValue = this.normalizeScalar(this.evaluateUnnamedExpression(toExpression, {}, executionContext));
    const stepValue = this.normalizeScalar(this.evaluateUnnamedExpression(stepExpression, {}, executionContext));

    const fromNumber = Number(fromValue);
    const toNumber = Number(toValue);
    const stepNumber = Number(stepValue);

    const labels: KustoScalar[] = [];
    let mapToIndex: (value: KustoScalar) => number | null;

    if (Number.isFinite(fromNumber) && Number.isFinite(toNumber) && Number.isFinite(stepNumber) && stepNumber > 0) {
      for (let current = fromNumber; current < toNumber; current += stepNumber) {
        labels.push(current);
      }

      mapToIndex = (value: KustoScalar) => {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue) || numericValue < fromNumber || numericValue >= toNumber) {
          return null;
        }

        const rawIndex = Math.floor((numericValue - fromNumber) / stepNumber);
        return rawIndex >= 0 && rawIndex < labels.length ? rawIndex : null;
      };
    } else {
      const fromDate = this.toDateValue(fromValue);
      const toDate = this.toDateValue(toValue);
      const stepMilliseconds = this.toTimespanMilliseconds(stepValue);
      if (!fromDate || !toDate || !stepMilliseconds || stepMilliseconds <= 0) {
        throw new Error('Unsupported make-series from/to/step values.');
      }

      for (let current = fromDate.getTime(); current < toDate.getTime(); current += stepMilliseconds) {
        labels.push(this.formatKustoDateTime(new Date(current)));
      }

      mapToIndex = (value: KustoScalar) => {
        const date = this.toDateValue(value);
        if (!date) {
          return null;
        }

        const milliseconds = date.getTime();
        const fromMilliseconds = fromDate.getTime();
        const toMilliseconds = toDate.getTime();
        if (milliseconds < fromMilliseconds || milliseconds >= toMilliseconds) {
          return null;
        }

        const rawIndex = Math.floor((milliseconds - fromMilliseconds) / stepMilliseconds);
        return rawIndex >= 0 && rawIndex < labels.length ? rawIndex : null;
      };
    }

    const onColumnName = getAlias(on) ?? on.unnamedExpression().getText();
    const groups = new Map<string, { byRow: KustoRow; bins: KustoRow[][] }>();

    for (const row of rows) {
      const byRow: KustoRow = {};
      for (const expression of by) {
        const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), row, executionContext));
        const name = getAlias(expression) ?? expression.unnamedExpression().getText();
        byRow[name] = value;
      }

      const key = JSON.stringify(byRow);
      const existing = groups.get(key) ?? {
        byRow,
        bins: Array.from({ length: labels.length }, () => [] as KustoRow[]),
      };

      const index = mapToIndex(this.normalizeScalar(this.evaluateUnnamedExpression(on.unnamedExpression(), row, executionContext)));
      if (index !== null) {
        existing.bins[index].push(row);
      }

      groups.set(key, existing);
    }

    if (groups.size === 0 && by.length === 0) {
      groups.set('{}', {
        byRow: {},
        bins: Array.from({ length: labels.length }, () => [] as KustoRow[]),
      });
    }

    const results: KustoRow[] = [];
    for (const group of groups.values()) {
      const nextRow: KustoRow = { ...group.byRow };

      for (const aggregation of aggregations) {
        const columnName = aggregation.alias
          ?? (aggregation.valueExpression
            ? `${aggregation.functionName}_${aggregation.valueExpression.unnamedExpression().getText()}`
            : `${aggregation.functionName}_`);
        const defaultValue = aggregation.defaultExpression
          ? this.normalizeScalar(this.evaluateUnnamedExpression(aggregation.defaultExpression.unnamedExpression(), {}, executionContext))
          : null;

        const values = group.bins.map((binRows) => {
          if (binRows.length === 0) {
            return defaultValue;
          }

          if (aggregation.functionName === 'count') {
            return binRows.length;
          }

          if (!aggregation.valueExpression) {
            return defaultValue;
          }

          const valuesInBin = binRows
            .map((binRow) => this.normalizeScalar(this.evaluateUnnamedExpression(aggregation.valueExpression!.unnamedExpression(), binRow, executionContext)))
            .filter((value) => value !== null);

          if (valuesInBin.length === 0) {
            return defaultValue;
          }

          if (aggregation.functionName === 'sum') {
            let sum = 0;
            for (const value of valuesInBin) {
              const numericValue = Number(value);
              if (Number.isFinite(numericValue)) {
                sum += numericValue;
              }
            }

            return sum;
          }

          if (aggregation.functionName === 'avg') {
            let sum = 0;
            let count = 0;
            for (const value of valuesInBin) {
              const numericValue = Number(value);
              if (Number.isFinite(numericValue)) {
                sum += numericValue;
                count += 1;
              }
            }

            return count === 0 ? defaultValue : sum / count;
          }

          if (aggregation.functionName === 'min') {
            let minValue: KustoScalar = null;
            for (const value of valuesInBin) {
              if (minValue === null || this.compareValues(value, minValue) < 0) {
                minValue = value;
              }
            }

            return minValue ?? defaultValue;
          }

          let maxValue: KustoScalar = null;
          for (const value of valuesInBin) {
            if (maxValue === null || this.compareValues(value, maxValue) > 0) {
              maxValue = value;
            }
          }

          return maxValue ?? defaultValue;
        });

        nextRow[columnName] = values;
      }

      nextRow[onColumnName] = labels;

      results.push(nextRow);
    }

    return results;
  }

  private applySummarizeAst(
    rows: KustoRow[],
    aggregations: NamedExpressionContext[],
    by: NamedExpressionContext[],
    executionContext: ExecutionContext,
  ): KustoRow[] {
    return this.summarizeOperator.apply(rows, aggregations, by, executionContext);
  }

  private compareValues(left: KustoScalar, right: KustoScalar): number {
    if (left === right) {
      return 0;
    }

    if (left === null) {
      return -1;
    }

    if (right === null) {
      return 1;
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left < right ? -1 : 1;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left ? 1 : -1;
    }

    if (left instanceof Date && right instanceof Date) {
      const leftTime = left.getTime();
      const rightTime = right.getTime();
      if (leftTime === rightTime) {
        return 0;
      }

      return leftTime < rightTime ? -1 : 1;
    }

    if (typeof left === 'string' && typeof right === 'string') {
      return left < right ? -1 : 1;
    }

    const leftText = String(left);
    const rightText = String(right);
    if (leftText === rightText) {
      return 0;
    }

    return leftText < rightText ? -1 : 1;
  }

  private applyPartitionAst(
    rows: KustoRow[],
    byExpression: EntityExpressionContext,
    subExpressionOperators: AfterPipeOperatorContext[],
    executionContext: ExecutionContext,
  ): KustoRow[] {
    return this.tabularOperators.applyPartition(rows, byExpression, subExpressionOperators, executionContext);
  }

  private createPrintRows(expressions: NamedExpressionContext[], executionContext: ExecutionContext): KustoRow[] {
    const row: KustoRow = {};
    for (let index = 0; index < expressions.length; index++) {
      const expression = expressions[index];
      const name = getAlias(expression) ?? `print_${index}`;
      const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), {}, executionContext));
      row[name] = value;
    }

    return [row];
  }

  private evaluateUnnamedExpression(
    unnamedExpression: UnnamedExpressionContext,
    row: KustoRow,
    executionContext: ExecutionContext,
  ): KustoScalar {
    return this.expressionAstEvaluator.evaluateUnnamedExpression(unnamedExpression, row, executionContext);
  }

  private createRangeRows(
    columnName: string,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
    executionContext: ExecutionContext,
  ): KustoRow[] {
    return this.expressionAstEvaluator.createRangeRows(columnName, fromExpression, toExpression, stepExpression, executionContext);
  }

  private getQuerySourceRows(sourceName: string, executionContext: ExecutionContext): KustoRow[] {
    const normalized = this.normalizeName(sourceName);
    const letRows = executionContext.tableBindings.get(normalized);
    if (letRows) {
      return letRows.map((row) => ({ ...row }));
    }

    return this.getTable(normalized);
  }

  private normalizeName(name: string): string {
    return name.trim().replace(/;+$/, '');
  }

  private createDeterministicUuid(seed: string): string {
    const hex = createHash('sha256').update(seed).digest('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  private createTimespan(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const fractionalMs = milliseconds % 1000;
    const ticks = String(fractionalMs * 10000).padStart(7, '0');
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${ticks}`;
  }

  private toOrderedColumns(schemaText: string): Array<{ Name: string; Type: string; CslType: string }> {
    return schemaText
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => {
        const [namePart, typePart] = entry.split(':');
        const columnName = (namePart ?? '').trim();
        const cslType = (typePart ?? 'string').trim().toLowerCase();
        return {
          Name: columnName,
          Type: this.mapCslTypeToSystemType(cslType),
          CslType: cslType,
        };
      });
  }

  private mapCslTypeToSystemType(cslType: string): string {
    const normalized = this.normalizeScalarTypeName(cslType);
    if (normalized === 'int') {
      return 'System.Int32';
    }
    if (normalized === 'long') {
      return 'System.Int64';
    }
    if (normalized === 'real') {
      return 'System.Double';
    }
    if (normalized === 'decimal') {
      return 'System.Decimal';
    }
    if (normalized === 'bool') {
      return 'System.Boolean';
    }
    if (normalized === 'datetime') {
      return 'System.DateTime';
    }
    if (normalized === 'timespan') {
      return 'System.TimeSpan';
    }
    if (normalized === 'guid') {
      return 'System.Guid';
    }
    if (normalized === 'dynamic') {
      return 'System.Object';
    }

    return 'System.String';
  }

  private normalizeScalarTypeName(typeName: string): string {
    const normalized = typeName.trim().toLowerCase();
    if (normalized === 'boolean') {
      return 'bool';
    }

    if (normalized === 'date') {
      return 'datetime';
    }

    if (normalized === 'double') {
      return 'real';
    }

    if (normalized === 'time') {
      return 'timespan';
    }

    if (normalized === 'uuid' || normalized === 'uniqueid') {
      return 'guid';
    }

    return normalized;
  }

  private tryParseTypedScalarLiteral(typeName: string, innerText: string): KustoScalar | undefined {
    const normalizedTypeName = this.normalizeScalarTypeName(typeName);
    const supportedTypedLiterals = new Set([
      'bool',
      'datetime',
      'decimal',
      'dynamic',
      'guid',
      'int',
      'long',
      'real',
      'string',
      'timespan',
    ]);
    if (!supportedTypedLiterals.has(normalizedTypeName)) {
      return undefined;
    }

    const trimmedInnerText = innerText.trim();
    if (trimmedInnerText.length === 0 || /^null$/i.test(trimmedInnerText)) {
      return null;
    }

    const parsedInnerValue = this.parseScalar(trimmedInnerText);

    const toInteger = (value: KustoScalar): number | null => {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? Math.trunc(value) : null;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!/^-?\d+$/.test(trimmed)) {
          return null;
        }

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
      }

      return null;
    };

    const toNumber = (value: KustoScalar): number | null => {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
      }

      if (typeof value === 'string') {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
      }

      return null;
    };

    const toBoolean = (value: KustoScalar): boolean | null => {
      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'number') {
        if (value === 0) {
          return false;
        }

        if (value === 1) {
          return true;
        }

        return null;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim().toLowerCase();
        if (trimmed === 'true' || trimmed === '1') {
          return true;
        }

        if (trimmed === 'false' || trimmed === '0') {
          return false;
        }
      }

      return null;
    };

    const toGuid = (value: KustoScalar): string | null => {
      if (typeof value !== 'string') {
        return null;
      }

      const trimmed = value.trim();
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
        return null;
      }

      return trimmed.toLowerCase();
    };

    if (normalizedTypeName === 'int' || normalizedTypeName === 'long') {
      return toInteger(parsedInnerValue);
    }

    if (normalizedTypeName === 'real' || normalizedTypeName === 'decimal') {
      return toNumber(parsedInnerValue);
    }

    if (normalizedTypeName === 'bool') {
      return toBoolean(parsedInnerValue);
    }

    if (normalizedTypeName === 'datetime') {
      const datetimeText = typeof parsedInnerValue === 'string' ? parsedInnerValue : String(parsedInnerValue);
      const parsedDate = this.toDateValue(datetimeText);
      return parsedDate ? parsedDate.toISOString() : null;
    }

    if (normalizedTypeName === 'timespan') {
      const timespanText = typeof parsedInnerValue === 'string' ? parsedInnerValue : String(parsedInnerValue);
      const timespanMilliseconds = this.toTimespanMilliseconds(timespanText);
      return timespanMilliseconds === null ? null : timespanText.trim();
    }

    if (normalizedTypeName === 'guid') {
      return toGuid(parsedInnerValue);
    }

    if (normalizedTypeName === 'dynamic') {
      try {
        return this.normalizeScalar(JSON.parse(trimmedInnerText));
      } catch {
        // Fallback preserves non-JSON dynamic payloads as scalars.
      }

      return this.normalizeScalar(parsedInnerValue);
    }

    if (normalizedTypeName === 'string') {
      return String(parsedInnerValue);
    }

    return undefined;
  }

  private parseScalar(text: string): KustoScalar {
    const typedLiteralMatch = text.match(/^([A-Za-z_]\w*)\((.*)\)$/is);
    if (typedLiteralMatch) {
      const typedLiteralValue = this.tryParseTypedScalarLiteral(typedLiteralMatch[1], typedLiteralMatch[2]);
      if (typedLiteralValue !== undefined) {
        return typedLiteralValue;
      }
    }

    if (text.length >= 3 && text.startsWith('@"') && text.endsWith('"')) {
      return text.slice(2, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(text)) {
      return Number(text);
    }

    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('\'') && text.endsWith('\''))) {
      return text.slice(1, -1);
    }

    if (/^true$/i.test(text)) {
      return true;
    }

    if (/^false$/i.test(text)) {
      return false;
    }

    if (/^null$/i.test(text)) {
      return null;
    }

    const dynamicMatch = text.match(/^dynamic\((.*)\)$/s);
    if (dynamicMatch) {
      const payload = dynamicMatch[1].trim();
      try {
        if (payload.startsWith('{') || payload.startsWith('[') || payload.startsWith('"')) {
          return this.normalizeScalar(JSON.parse(payload));
        }
      } catch {
        return text;
      }

      return text;
    }

    return text;
  }

  private normalizeScalar(value: unknown): KustoScalar {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
      return value;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'object') {
      return value as KustoScalar;
    }

    return String(value);
  }

  private toDateValue(value: KustoScalar): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    const inner = lower.startsWith('datetime(') && trimmed.endsWith(')')
      ? trimmed.slice(9, -1).trim()
      : trimmed;
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(inner)
      ? `${inner}T00:00:00Z`
      : (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(inner) ? `${inner.replace(' ', 'T')}Z` : inner);
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
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

    const colonMatch = trimmed.match(/^(-)?(?:(\d+)\.)?(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/);
    if (colonMatch) {
      const sign = colonMatch[1] ? -1 : 1;
      const days = colonMatch[2] ? Number(colonMatch[2]) : 0;
      const hours = Number(colonMatch[3]);
      const minutes = Number(colonMatch[4]);
      const seconds = colonMatch[5] ? Number(colonMatch[5]) : 0;
      const fractionSeconds = colonMatch[6] ? Number(`0.${colonMatch[6]}`) : 0;
      const totalSeconds = ((days * 24 + hours) * 60 + minutes) * 60 + seconds + fractionSeconds;
      return sign * totalSeconds * 1_000;
    }

    const unitMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(ms|microseconds?|ticks?|s|m|h|d)$/i);
    if (!unitMatch) {
      return null;
    }

    const amount = Number(unitMatch[1]);
    if (!Number.isFinite(amount)) {
      return null;
    }

    const unit = unitMatch[2].toLowerCase();
    if (unit === 'tick' || unit === 'ticks') {
      return amount / 10_000;
    }

    if (unit === 'microsecond' || unit === 'microseconds') {
      return amount / 1_000;
    }

    if (unit === 'ms') {
      return amount;
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

  private formatKustoDateTime(date: Date): string {
    const iso = date.toISOString();
    return iso.replace(/\.(\d{3})Z$/, '.$10000Z');
  }
}