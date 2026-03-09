import type { EntityExpressionContext } from '../parser/KqlParser.js';
import type { KustoRow, QueryOperatorAst, TabularSourceAst } from './types.js';

export type TabularOperatorsOptions = {
  resolveTabularSourceRows: (source: TabularSourceAst) => KustoRow[];
  executePartitionSubquery: (groupRows: KustoRow[], subExpressionOperators: QueryOperatorAst[]) => KustoRow[];
};

export class TabularOperators {
  private readonly options: TabularOperatorsOptions;

  public constructor(options: TabularOperatorsOptions) {
    this.options = options;
  }

  public applyUnion(rows: KustoRow[], sources: TabularSourceAst[]): KustoRow[] {
    const unionRows = rows.map((row) => ({ ...row }));
    for (const source of sources) {
      unionRows.push(...this.options.resolveTabularSourceRows(source));
    }

    return unionRows;
  }

  public applyJoin(
    leftRows: KustoRow[],
    joinKind: 'inner' | 'leftouter',
    rightSource: TabularSourceAst,
    onExpressions: string[],
  ): KustoRow[] {
    const rightRows = this.options.resolveTabularSourceRows(rightSource);
    const onColumns = this.getJoinColumns(onExpressions);
    const output: KustoRow[] = [];

    if (joinKind === 'inner') {
      for (const rightRow of rightRows) {
        for (const leftRow of leftRows) {
          if (onColumns.every((column) => leftRow[column.left] === rightRow[column.right])) {
            output.push(this.mergeRows(leftRow, rightRow, true));
          }
        }
      }

      return output;
    }

    for (const leftRow of leftRows) {
      let matched = false;
      for (const rightRow of rightRows) {
        if (onColumns.every((column) => leftRow[column.left] === rightRow[column.right])) {
          matched = true;
          output.push(this.mergeRows(leftRow, rightRow, true));
        }
      }

      if (!matched && joinKind === 'leftouter') {
        output.push(this.mergeRows(leftRow, {}, true));
      }
    }

    return output;
  }

  public applyLookup(
    leftRows: KustoRow[],
    lookupKind: 'inner' | 'leftouter',
    rightSource: TabularSourceAst,
    onExpressions: string[],
  ): KustoRow[] {
    const rightRows = this.options.resolveTabularSourceRows(rightSource);
    const onColumns = this.getJoinColumns(onExpressions);
    const rightJoinColumns = new Set(onColumns.map((column) => column.right));
    const output: KustoRow[] = [];

    for (const leftRow of leftRows) {
      let matched = false;
      for (const rightRow of rightRows) {
        if (onColumns.every((column) => leftRow[column.left] === rightRow[column.right])) {
          matched = true;
          output.push(this.mergeRows(leftRow, rightRow, false, rightJoinColumns));
        }
      }

      if (!matched && lookupKind === 'leftouter') {
        output.push({ ...leftRow });
      }
    }

    return output;
  }

  public applyPartition(
    rows: KustoRow[],
    byExpression: EntityExpressionContext,
    subExpressionOperators: QueryOperatorAst[],
  ): KustoRow[] {
    const groups = new Map<string, KustoRow[]>();

    for (const row of rows) {
      const keyName = byExpression.getText();
      const keyValue = Object.hasOwn(row, keyName) ? row[keyName] : null;
      const key = JSON.stringify(keyValue);
      const groupRows = groups.get(key) ?? [];
      groupRows.push({ ...row });
      groups.set(key, groupRows);
    }

    const output: KustoRow[] = [];
    for (const groupRows of groups.values()) {
      output.push(...this.options.executePartitionSubquery(groupRows, subExpressionOperators));
    }

    return output;
  }

  private getJoinColumns(onExpressions: string[]): Array<{ left: string; right: string }> {
    if (onExpressions.length === 0) {
      throw new Error('join/lookup requires ON clause.');
    }

    return onExpressions.map((expression) => {
      const equalsIndex = expression.indexOf('==');
      if (equalsIndex < 0) {
        const column = expression.replace(/^\$left\./, '').replace(/^\$right\./, '');
        return { left: column, right: column };
      }

      const left = expression.slice(0, equalsIndex).replace(/^\$left\./, '').trim();
      const right = expression.slice(equalsIndex + 2).replace(/^\$right\./, '').trim();
      return { left, right };
    });
  }

  private mergeRows(
    leftRow: KustoRow,
    rightRow: KustoRow,
    includeRightJoinKeys: boolean,
    rightJoinKeys: Set<string> = new Set(),
  ): KustoRow {
    const merged: KustoRow = { ...leftRow };
    for (const [key, value] of Object.entries(rightRow)) {
      if (!includeRightJoinKeys && rightJoinKeys.has(key)) {
        continue;
      }

      if (Object.hasOwn(merged, key)) {
        merged[`${key}1`] = value;
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }
}
