import { Injectable } from '@angular/core';
import { Events, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { checkForNull } from '../util/util';

import { ICondition } from './statement';
import { Delete } from './statement/delete';
import { Select } from './statement/select';

import {
  TABLES,
  TABLE_MOVIES_NAME,
  TABLE_SHOWTIMES_NAME,
  TABLE_PRICES_NAME,
  IValue,
} from './table';

// Database name
const DB_NAME: string = 'amenic.db';

@Injectable()
class Database {

  /** SQLite db instance used to execute queries */
  private mDatabase: SQLiteObject;

  /** Whether the databse is open or not */
  private mIsOpen: boolean = false;

  constructor(public events: Events) { }

  public init = (sqlite: SQLite, platform?: Platform) => {
    sqlite.create({
      name: DB_NAME,
      location: 'default',
    })
    .then((db: SQLiteObject) => {
      this.mDatabase = db;
      this.createTablesIfNotExists();
    })
    .catch(e => console.log(e));
  }

  private createTablesIfNotExists() {
    Promise.all([
      this.createTable(TABLE_MOVIES_NAME),
      this.createTable(TABLE_SHOWTIMES_NAME),
      this.createTable(TABLE_PRICES_NAME),
    ])
    .then(() => {
      this.mIsOpen = true;
      this.events.publish('database:ready');
    })
    .catch(e => console.log(e));
  }

  private reset() {
    Promise.all([
      this.dropTable(TABLE_MOVIES_NAME),
      this.dropTable(TABLE_SHOWTIMES_NAME),
      this.dropTable(TABLE_PRICES_NAME),
      this.createTable(TABLE_MOVIES_NAME),
      this.createTable(TABLE_SHOWTIMES_NAME),
      this.createTable(TABLE_PRICES_NAME),
    ])
    .then(() => {
      this.mIsOpen = true;
      this.events.publish('database:ready');
    })
    .catch(e => console.log(e));
  }

  // Creates a given table
  private createTable(name: string) {
    checkForNull(this.mDatabase, 'db');

    const columns = TABLES[name];
    checkForNull(columns, 'columns');

    let statement = `CREATE TABLE IF NOT EXISTS ${name} (`;
    columns.forEach((column, index) => {
      // Just to avoid extra string concatenations to include ) or ,
      if (index === columns.length - 1) {
        statement += `${column.name} ${column.type})`;
      } else if (index < columns.length - 1) {
        statement += `${column.name} ${column.type}, `;
      } else {
        statement += `${column.name} ${column.type}`;
      }
    });

    return this.mDatabase.executeSql(statement, {});
  }

  // Insert into the given table
  public insert(table: string, values: IValue[]) {
    checkForNull(this.mDatabase, 'db');
    checkForNull(table, 'table');
    checkForNull(values, 'values');

    let statement = `INSERT INTO ${table}`;
    const fields = values.map(value => value.field);
    const _values = values.map(value => value.value);

    statement += ' (';
    statement += fields.join(', ');
    statement += ') VALUES (';
    statement += values.map(value => '?').join(', ');
    statement += ')';

    console.log('Statement: ' + statement);
    
    return this.mDatabase.executeSql(statement, _values);
  }

  // Selects fields from the given table
  public findAll(table: string, fields?: string[], conditions?: ICondition[]): Promise<any> {
    checkForNull(table, 'table');
    if (!fields) {
      fields = [];
    }

    if (!conditions) {
      conditions = [];
    }

    const statement = new Select().from(table).where(null, null, conditions).build();
    const values = conditions.map(condition => condition.value);

    return new Promise((resolve, reject) => {
      this.mDatabase.executeSql(statement, values)
        .then((resultSet) => {
          const results = [];
          for (let i = 0; i < resultSet.rows.length; i++) {
            results.push(resultSet.rows.item(i));
          }
          resolve(results);
        })
        .catch(e => {
          console.log(e);
          reject(e);
        });
    });
  }

  // Drops a table
  public dropTable(table: string) {
    checkForNull(table, 'table');
    const statement = `DROP TABLE IF EXISTS ${table}`;

    return this.mDatabase.executeSql(statement, {});
  }

  // Delete all records that match a given condition from table
  // To delete all just call this with no conditions
  public delete(table: string, conditions?: ICondition[]) {
    checkForNull(table, 'table');
    
    if (!conditions) {
      conditions = [];
    }
    
    const statement = new Delete().from(table).where(null, null, conditions).build();
    const values = conditions.map(condition => condition.value);

    return this.mDatabase.executeSql(statement, values);
  }

  /** Returns true if database is open and false if not */
  public isOpen(): boolean {
    return this.mIsOpen;
  }
}

export { Database }
