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
import { executePipeExpression, applyOperators, type QueryAstExecutionHandlers } from './query-ast-executor.js';
import { SummarizeOperator } from './summarize-operator.js';
import { TabularOperators } from './tabular-operators.js';
import { ExpressionAstEvaluator } from './expression-ast-evaluator.js';
import type {
  KustoExecutionResult,
  KustoRow,
  KustoScalar,
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
    evaluateUnnamedExpression: (unnamedExpression, row) => this.evaluateUnnamedExpression(unnamedExpression, row),
    normalizeScalar: (value) => this.normalizeScalar(value),
    compareValues: (left, right) => this.compareValues(left, right),
  });
  private readonly tabularOperators = new TabularOperators({
    executePartitionSubquery: (groupRows, subExpressionOperators) =>
      applyOperators(groupRows.map((row) => ({ ...row })), subExpressionOperators, this.queryExecutionHandlers, null),
  });
  private readonly expressionAstEvaluator = new ExpressionAstEvaluator({
    parseScalar: (text) => this.parseScalar(text),
    normalizeScalar: (value) => this.normalizeScalar(value),
    compareValues: (left, right) => this.compareValues(left, right),
    resolveLetScalar: (name) => {
      if (this.currentLetBindings && Object.hasOwn(this.currentLetBindings, name)) {
        return this.currentLetBindings[name];
      }

      return undefined;
    },
    evaluateToScalarExpression: (toScalarExpression) => this.evaluateToScalarExpression(toScalarExpression),
  });
  private readonly queryExecutionHandlers: QueryAstExecutionHandlers = {
    parserOptions: this.parserOptions,
    resolveTableSource: (name) => this.getQuerySourceRows(name),
    resolveDataTableSource: (expressionText) => this.createRowsFromDataTableText(expressionText),
    resolvePrintSource: (expressions) => this.createPrintRows(expressions),
    resolveRangeSource: (columnName, fromExpression, toExpression, stepExpression) =>
      this.createRangeRows(columnName, fromExpression, toExpression, stepExpression),
    applyTake: (rows, amountExpression) => this.applyTakeAst(rows, amountExpression),
    applyWhere: (rows, predicateExpression) => this.applyWhereAst(rows, predicateExpression),
    applyExtend: (rows, expressions) => this.applyExtendAst(rows, expressions),
    applyProject: (rows, expressions) => this.applyProjectAst(rows, expressions),
    applyProjectAway: (rows, columns) => this.applyProjectAwayAst(rows, columns),
    applyProjectRename: (rows, expressions) => this.applyProjectRenameAst(rows, expressions),
    applyCount: (rows) => this.applyCountAst(rows),
    applyDistinct: (rows, includeAllColumns, expressions) => this.applyDistinctAst(rows, includeAllColumns, expressions),
    applySort: (rows, expressions) => this.applySortAst(rows, expressions),
    applyTop: (rows, amountExpression, by) => this.applyTopAst(rows, amountExpression, by),
    applyMvExpand: (rows, expressions, limit) => this.applyMvExpandAst(rows, expressions, limit),
    applyMakeSeries: (rows, aggregations, on, fromExpression, toExpression, stepExpression, by) =>
      this.applyMakeSeriesAst(rows, aggregations, on, fromExpression, toExpression, stepExpression, by),
    applySummarize: (rows, aggregations, by) => this.applySummarizeAst(rows, aggregations, by),
    applyUnion: (rows, unionRows) => this.tabularOperators.applyUnion(rows, unionRows),
    applyPartition: (rows, byExpression, subExpressionOperators) =>
      this.applyPartitionAst(rows, byExpression, subExpressionOperators),
    applyJoin: (rows, joinKind, rightRows, on) => this.tabularOperators.applyJoin(rows, joinKind, rightRows, on),
    applyLookup: (rows, lookupKind, rightRows, on) => this.tabularOperators.applyLookup(rows, lookupKind, rightRows, on),
  };
  private currentLetBindings: KustoRow | null = null;
  private currentLetTableBindings: Map<string, KustoRow[]> | null = null;

  public constructor(options: KustoInterpreterOptions = {}) {
    this.defaultDatabaseName = options.databaseName ?? null;
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
      return this.executeCommand(pipeExpression, command, startedAt);
    }

      return this.executeScriptStatements(statements, startedAt, command, options);
  }

  private async executeCommand(
    pipeExpression: PipeExpressionContext,
    rawCommand: string,
    startedAt: number,
  ): Promise<KustoExecutionResult> {
    const managementCtx = pipeExpression.beforePipeExpression().managementCommandExpression();
    if (managementCtx) {
      const parsed = extractManagementCommandFields(managementCtx, rawCommand);
      const rows = await this.executeManagementCommand(parsed, managementCtx);
      return this.decorateManagementResult(parsed, rows, startedAt);
    }

    const rows = this.executePipeExpression(pipeExpression, rawCommand);
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
    const letBindings: KustoRow = this.normalizeQueryParameters(options.queryParameters);
    const letTableBindings = new Map<string, KustoRow[]>();
    let finalPipeExpression: PipeExpressionContext | null = null;

    for (const statement of statements) {
      const statementVisitor = new KqlVisitor<void>();
      statementVisitor.visitDeclareQueryParametersStatement = (ctx) => {
        this.executeDeclareQueryParametersStatement(ctx, letBindings);
      };
      statementVisitor.visitLetMaterializeDeclaration = (ctx) => {
        const name = ctx.identifierOrKeywordOrEscapedName().getText();
        const previousBindings = this.currentLetBindings;
        const previousTableBindings = this.currentLetTableBindings;
        this.currentLetBindings = letBindings;
        this.currentLetTableBindings = letTableBindings;
        try {
          const rows = this.executePipeExpression(ctx.pipeExpression(), null).map((row) => ({ ...row }));
          letTableBindings.set(name, rows);
          delete letBindings[name];
        } finally {
          this.currentLetBindings = previousBindings;
          this.currentLetTableBindings = previousTableBindings;
        }
      };
      statementVisitor.visitLetVariableDeclaration = (ctx) => {
        const name = ctx.identifierOrKeywordOrEscapedName().getText();
        const pipeExpression = ctx.expression().pipeExpression();
        const letRows = this.tryEvaluateLetTabularRows(pipeExpression, letBindings, letTableBindings);
        if (letRows) {
          letTableBindings.set(name, letRows);
          delete letBindings[name];
          return;
        }
        const unnamedExpression = pipeExpression.beforePipeExpression().unnamedExpression();
        if (!unnamedExpression) {
          throw new Error('Unsupported let variable expression.');
        }
        const value = this.normalizeScalar(this.evaluateUnnamedExpression(unnamedExpression, letBindings));
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

    const previousBindings = this.currentLetBindings;
    const previousTableBindings = this.currentLetTableBindings;
    this.currentLetBindings = letBindings;
    this.currentLetTableBindings = letTableBindings;
    try {
      return this.executeCommand(finalPipeExpression, rawCommand, startedAt);
    } finally {
      this.currentLetBindings = previousBindings;
      this.currentLetTableBindings = previousTableBindings;
    }
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
    letBindings: KustoRow,
    letTableBindings: Map<string, KustoRow[]>,
  ): KustoRow[] | null {
    const materializedRows = this.tryEvaluateLetMaterializeRows(pipeExpression, letBindings, letTableBindings);
    if (materializedRows) {
      return materializedRows;
    }

    const dataTableRows = this.tryEvaluateLetDataTableRows(pipeExpression);
    if (dataTableRows) {
      return dataTableRows;
    }

    if (!this.isTabularLetExpression(pipeExpression, letTableBindings)) {
      return null;
    }

    const previousBindings = this.currentLetBindings;
    const previousTableBindings = this.currentLetTableBindings;
    this.currentLetBindings = letBindings;
    this.currentLetTableBindings = letTableBindings;
    try {
      const rows = this.executePipeExpression(pipeExpression, null);
      return rows.map((row) => ({ ...row }));
    } finally {
      this.currentLetBindings = previousBindings;
      this.currentLetTableBindings = previousTableBindings;
    }
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
    letBindings: KustoRow,
    letTableBindings: Map<string, KustoRow[]>,
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

    const previousBindings = this.currentLetBindings;
    const previousTableBindings = this.currentLetTableBindings;
    this.currentLetBindings = letBindings;
    this.currentLetTableBindings = letTableBindings;
    try {
      const rows = this.executePipeExpression(materializedPipeExpression, null);
      return rows.map((row) => ({ ...row }));
    } finally {
      this.currentLetBindings = previousBindings;
      this.currentLetTableBindings = previousTableBindings;
    }
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
    switch (sourceType) {
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
        return typeof value === 'object';
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

  private executePipeExpression(pipeExpression: PipeExpressionContext, rawCommand: string | null): KustoRow[] {
    return executePipeExpression(pipeExpression, rawCommand, this.queryExecutionHandlers);
  }

  private evaluateToScalarExpression(toScalarExpression: ToScalarExpressionContext): KustoScalar {
    const pipeExpression = toScalarExpression.pipeExpression();
    const rows = this.executePipeExpression(pipeExpression, null);
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
    const type = this.schemaTypes.get(tableName)?.get(column)?.toLowerCase();

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

  private applyTakeAst(rows: KustoRow[], amountExpression: UnnamedExpressionContext): KustoRow[] {
    const amountValue = this.evaluateUnnamedExpression(amountExpression, {});
    const amount = Number(amountValue);

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
      throw new Error(`Invalid take value: ${String(amountValue)}`);
    }

    return rows.slice(0, amount);
  }

  private applyWhereAst(rows: KustoRow[], predicateExpression: UnnamedExpressionContext): KustoRow[] {
    return rows.filter((row) => Boolean(this.evaluateUnnamedExpression(predicateExpression, row)));
  }

  private applyExtendAst(rows: KustoRow[], expressions: NamedExpressionContext[]): KustoRow[] {
    return rows.map((row) => {
      const next = { ...row };

      for (const expression of expressions) {
        const alias = getAlias(expression);
        if (!alias) {
          throw new Error(`Invalid extend expression: ${expression.unnamedExpression().getText()}`);
        }

        const value = this.evaluateUnnamedExpression(expression.unnamedExpression(), next);
        if (Array.isArray(value)) {
          next[alias] = value;
        } else {
          next[alias] = this.normalizeScalar(value);
        }
      }

      return next;
    });
  }

  private applyProjectAst(rows: KustoRow[], expressions: NamedExpressionContext[]): KustoRow[] {
    return rows.map((row) => {
      const projected: KustoRow = {};

      for (const expression of expressions) {
        const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), row));
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

  private applyDistinctAst(rows: KustoRow[], includeAllColumns: boolean, expressions: NamedExpressionContext[]): KustoRow[] {
    const seen = new Set<string>();
    const distinctRows: KustoRow[] = [];

    for (const row of rows) {
      let projected: KustoRow;
      if (includeAllColumns) {
        projected = { ...row };
      } else {
        projected = {};
        for (const expression of expressions) {
          const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), row));
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

  private applySortAst(rows: KustoRow[], expressions: OrderedExpressionContext[]): KustoRow[] {
    if (expressions.length === 0) {
      return rows;
    }

    const sorted = [...rows];
    sorted.sort((left, right) => {
      for (const expression of expressions) {
        const leftValue = this.evaluateUnnamedExpression(expression.namedExpression().unnamedExpression(), left);
        const rightValue = this.evaluateUnnamedExpression(expression.namedExpression().unnamedExpression(), right);

        const comparison = this.compareValues(leftValue, rightValue);
        if (comparison !== 0) {
          return isDescending(expression) ? -comparison : comparison;
        }
      }

      return 0;
    });

    return sorted;
  }

  private applyTopAst(rows: KustoRow[], amountExpression: UnnamedExpressionContext, by: OrderedExpressionContext): KustoRow[] {
    const amount = Number(this.evaluateUnnamedExpression(amountExpression, {}));
    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
      throw new Error(`Invalid top value: ${String(amount)}`);
    }

    const sorted = this.applySortAst(rows, [by]);
    return sorted.slice(0, amount);
  }

  private applyMvExpandAst(rows: KustoRow[], expressions: NamedExpressionContext[], limit: number | null): KustoRow[] {
    if (expressions.length === 0) {
      return rows;
    }

    let expandedRows = rows.map((row) => ({ ...row }));

    for (const expression of expressions) {
      const nextRows: KustoRow[] = [];
      for (const row of expandedRows) {
        const value = this.evaluateUnnamedExpression(expression.unnamedExpression(), row);
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
  ): KustoRow[] {
    if (aggregations.length === 0) {
      throw new Error('make-series requires at least one aggregation.');
    }

    const fromValue = this.normalizeScalar(this.evaluateUnnamedExpression(fromExpression, {}));
    const toValue = this.normalizeScalar(this.evaluateUnnamedExpression(toExpression, {}));
    const stepValue = this.normalizeScalar(this.evaluateUnnamedExpression(stepExpression, {}));

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
        const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), row));
        const name = getAlias(expression) ?? expression.unnamedExpression().getText();
        byRow[name] = value;
      }

      const key = JSON.stringify(byRow);
      const existing = groups.get(key) ?? {
        byRow,
        bins: Array.from({ length: labels.length }, () => [] as KustoRow[]),
      };

      const index = mapToIndex(this.normalizeScalar(this.evaluateUnnamedExpression(on.unnamedExpression(), row)));
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
          ? this.normalizeScalar(this.evaluateUnnamedExpression(aggregation.defaultExpression.unnamedExpression(), {}))
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
            .map((binRow) => this.normalizeScalar(this.evaluateUnnamedExpression(aggregation.valueExpression!.unnamedExpression(), binRow)))
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

  private applySummarizeAst(rows: KustoRow[], aggregations: NamedExpressionContext[], by: NamedExpressionContext[]): KustoRow[] {
    return this.summarizeOperator.apply(rows, aggregations, by);
  }

  private compareValues(left: KustoScalar, right: KustoScalar): number {
    if (left === right) {
      return 0;
    }

    if (left === null) {
      return 1;
    }

    if (right === null) {
      return -1;
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left < right ? -1 : 1;
    }

    if (left instanceof Date && right instanceof Date) {
      const leftTime = left.getTime();
      const rightTime = right.getTime();
      if (leftTime === rightTime) {
        return 0;
      }

      return leftTime < rightTime ? -1 : 1;
    }

    const leftText = String(left);
    const rightText = String(right);
    return leftText.localeCompare(rightText);
  }

  private applyPartitionAst(
    rows: KustoRow[],
    byExpression: EntityExpressionContext,
    subExpressionOperators: AfterPipeOperatorContext[],
  ): KustoRow[] {
    return this.tabularOperators.applyPartition(rows, byExpression, subExpressionOperators);
  }

  private createPrintRows(expressions: NamedExpressionContext[]): KustoRow[] {
    const row: KustoRow = {};
    for (let index = 0; index < expressions.length; index++) {
      const expression = expressions[index];
      const name = getAlias(expression) ?? `print_${index}`;
      const value = this.normalizeScalar(this.evaluateUnnamedExpression(expression.unnamedExpression(), {}));
      row[name] = value;
    }

    return [row];
  }

  private evaluateUnnamedExpression(unnamedExpression: UnnamedExpressionContext, row: KustoRow): KustoScalar {
    return this.expressionAstEvaluator.evaluateUnnamedExpression(unnamedExpression, row);
  }

  private createRangeRows(
    columnName: string,
    fromExpression: UnnamedExpressionContext,
    toExpression: UnnamedExpressionContext,
    stepExpression: UnnamedExpressionContext,
  ): KustoRow[] {
    return this.expressionAstEvaluator.createRangeRows(columnName, fromExpression, toExpression, stepExpression);
  }

  private getQuerySourceRows(sourceName: string): KustoRow[] {
    const normalized = this.normalizeName(sourceName);
    const letRows = this.currentLetTableBindings?.get(normalized);
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
    const normalized = cslType.trim().toLowerCase();
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

  private parseScalar(text: string): KustoScalar {
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

  private formatKustoDateTime(date: Date): string {
    const iso = date.toISOString();
    return iso.replace(/\.(\d{3})Z$/, '.$10000Z');
  }
}