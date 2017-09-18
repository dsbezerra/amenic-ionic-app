import { checkForNull } from '../util/util';

export const TABLE_MOVIES_NAME: string = 'movies';
export const TABLE_SHOWTIMES_NAME: string = 'showtimes';
export const TABLE_PRICES_NAME: string = 'prices';

export interface IColumn {
  name: string;
  // SQLite field datatype
  type: string;
}

export interface IValue {
  field: string;
  value: any;
}

export const column = (name: string, type: string): IColumn => {
  checkForNull(name, 'name');
  checkForNull(type, 'type');
  return {
    name,
    type,
  };
}

export const value = (field: string, value: any): IValue => {
  checkForNull(field, 'field');
  checkForNull(value, 'value');
  return {
    field,
    value,
  };
}

// Table in_theaters spec
const TABLE_MOVIES = [
  column('id',             'string'),
  column('title',          'text'),
  column('poster',         'text'),
  column('plot',           'text'),
  column('trailer',        'text'),
  column('genres',         'text'),
  column('rating',         'integer'),
  column('runtime',        'integer'),
  column('isInTheaters',   'text'),
  column('isComingSoon',   'text'),
  column('cinemas',        'text'),
  column('studio',         'text'),
  column('releaseDate',    'datetime'),
  column('timestamp',      'datetime'),
];

// Table showtimes spec
const TABLE_SHOWTIMES = [
  column('id',            'string'),
  column('movie',         'string'),
  column('period_start',  'text'),
  column('period_end',    'text'),
  column('isSubbed',      'bit'),
  column('isDubbed',      'bit'),
  column('availableIn2D', 'bit'),
  column('availableIn3D', 'bit'),
  column('national',      'bit'),
  column('time',          'text'),
  column('room',          'integer'),
  column('weekday',       'integer'),
  column('cinema',        'text'),
];

// Table prices spec
const TABLE_PRICES = [
  /** Cinema and website should be in a cinema table */
  column('cinema',   'text'),
  column('website',  'text'),
  column('is2D',     'bit'),
  column('value',    'real'),
  column('weekdays', 'text'),
];

export interface TableMap {
  [name: string]: IColumn[];
}
export const TABLES: TableMap = {
  [TABLE_MOVIES_NAME]: TABLE_MOVIES,
  [TABLE_SHOWTIMES_NAME]: TABLE_SHOWTIMES,
  [TABLE_PRICES_NAME]: TABLE_PRICES,
}
