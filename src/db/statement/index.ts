import { checkForNull } from '../../util/util';

/** List of most used commands in SQL */
export enum Command {
  SELECT, /** extracts data from a database */
  UPDATE, /** updates data in a database */
  DELETE, /** deletes data from a database */
  INSERT_INTO, /** inserts new data into a database */
  CREATE_DATABASE, /** creates a new database */
  ALTER_DATABASE, /** modifies a database */
  CREATE_TABLE, /** creates a new table */
  ALTER_TABLE, /** modifies a table */
  DROP_TABLE, /** deletes a table */
  CREATE_INDEX, /** creates an index (search key) */
  DROP_INDEX, /** deletes an index */
}

/** List of operators */
export enum Operator {
  AND,
  OR,
  NOT
}

/** List of comparison operators */
export enum ComparisonOperator {
  EQUAL, /** = */
  /* TODO(diego): Implement other operators if necessary */
}

export interface ICondition {
  column: string;
  operator?: Operator;
  value?: any;
  comparisonOperator?: ComparisonOperator;
}

// TODO(diego):
// Implement ORDER BY
export abstract class Statement {

  protected mCommand: Command;
  protected mTable: string;
  protected mColumns: string[];
  protected mConditions: ICondition[];

  constructor(...columns: string[]) {
    if (columns.length === 1 && columns[0] === '*') {
      this.mColumns = [];
    } else {
      this.mColumns = columns;
    }

    this.mConditions = [];
  }

  public from(table: string): Statement {
    checkForNull(table, 'table');
    this.mTable = table;
    return this;
  }

  public conditions() {
    return this.mConditions;
  }

  public where(column?: string, operator?: Operator, conditions?: ICondition[], ): Statement {
    if (!conditions) {
      conditions = [];
    }

    if (conditions.length > 0) {
      this.mConditions = conditions;
    } else {
      this.mConditions.push({
        operator,
        column,
      });
    }

    return this;
  }

  /** Can be omitted so the builder knows that him need to put a ? */
  public isEqual(value: any): Statement {
    if (this.mConditions.length === 0) {
      throw new Error('a where call must be defined before using isEqual');
    }

    const i = this.mConditions.length - 1;
    this.mConditions[i].value = value;
    this.mConditions[i].comparisonOperator = ComparisonOperator.EQUAL;
    return this;
  }

  public and(column: string): Statement {
    if (this.mConditions.length === 0) {
      throw new Error('and cannot be called as first condition');
    }
    return this.where(column, Operator.AND);
  }

  public or(column: string): Statement {
    if (this.mConditions.length === 0) {
      throw new Error('or cannot be called as first condition');
    }
    return this.where(column, Operator.OR);
  }

  public not(column: string): Statement {
    return this.where(column, Operator.NOT);
  }

  public build(showValue: boolean = false): string {

    const command = this.getCommandName();
    // Builds the statement
    let statement = `${command} `;

    if (this.mCommand === Command.SELECT) {
      const fields = this.mColumns.length === 0 ? '*' : this.mColumns.join(', ');
      statement += `${fields} `;
    }

    statement += `FROM ${this.mTable}`;

    for (let i = 0; i < this.mConditions.length; i++) {
      const condition = this.mConditions[i];

      let operator = '';
      if (i === 0) {
        statement += ' WHERE ';
      } else if (condition.operator === Operator.AND) {
        operator = ' AND ';
      } else if (condition.operator === Operator.OR) {
        operator = ' OR ';
      }

      if (operator) {
        statement += operator;
      }

      const compOperator = this.getComparisonOperator(condition.comparisonOperator);
      // Use a flag to know wether we need to use ? or the value
      statement += `${condition.column} ${compOperator} ${showValue ? condition.value : '?'}`;
    }

    return statement;
  }

  private getCommandName() {
    let result = '';

    switch (this.mCommand) {
      case Command.SELECT:
        result = 'SELECT';
        break;
      case Command.DELETE:
        result = 'DELETE';
        break;
      default:
        break;
    }

    return result;
  }

  private getComparisonOperator(operator: ComparisonOperator) {
    let result = '';

    switch (operator) {
      case ComparisonOperator.EQUAL:
        result = '=';
        break;
      default:
        break;
    }

    return result;
  }
}