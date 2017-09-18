import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Network } from '@ionic-native/network';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';

import * as _ from 'lodash';

import { checkForNull } from '../util/util';

import { Delete } from '../db/statement/delete';
import { ICondition, ComparisonOperator, Operator } from '../db/statement';
import { Database } from '../db';
import { value } from '../db/table';
import {
  Query,
  MoviesQuery,
  ShowtimeQuery,
  PricesQuery,
} from './query';
import { SQLite } from '@ionic-native/sqlite';

import {
  mapLocalMovie,
  getMovieInsertionValues,
} from '../models/movie';

import {
  mapLocalShowtime,
  getShowtimeInsertionValues,
} from '../models/showtime';

import { mapLocalPrice } from '../models/price';

export enum FetchPolicy {
  /** Read data from local database first and if there's nothing or internet available fetch from remote server */
  CACHE_FIRST,
  /** Read data only from local database */
  CACHE_ONLY,
  /** Ignore cache and fetch from remote server */
  NETWORK_ONLY,
}

interface IComingSoonResponse {
  movies: any[];
}

interface IInTheatersResponse {
  cinema: string;
  period: {
    start: string;
    end: string;
  }
  movies: any[];
}

interface IPricesResponse {
  cinema: string;
  website: string;
  prices: any[];
}

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

const API_URI: string = 'https://amenic.herokuapp.com';

interface IModel {
  /** */
  name: string;
  /** Local table name */
  table: string;
  /** Remote server route */
  route: any;
}

interface IModels {
  [key: string]: IModel;
}

// Model names
const MOVIES: string = 'model:MOVIES';
const PRICES: string = 'model:PRICES';
const SHOWTIMES: string = 'model:SHOWTIMES';

const Models: IModels = {
  movies: {
    name: MOVIES,
    table: 'movies',
    route: 'movies',
  },
  prices: {
    name: PRICES,
    table: 'prices',
    route: 'prices',
  },
  showtimes: {
    name: SHOWTIMES,
    table: 'showtimes',
    route: 'showtimes',
  },
}

@Injectable()
export class DataService {
  constructor(
    private http: Http,
    private network: Network,
    private database: Database,
  ) {
    this.database = database;
    this.http = http;
    this.network = network;
  }

  public init(sqlite: SQLite, events: Events) {
    this.database = new Database(events);
    this.database.init(sqlite);
  }

  public putNotification(notification: any) {
    const { title, message, type } = notification;
    this.database.insert('notifications', [
      value('title', title),
      value('message', message),
      value('type', type),
    ])
    .then(() => console.log('Inserted.'));
  }

  /** Get movies */
  public getMovies(query: Query, fetchPolicy?: FetchPolicy): Promise<IComingSoonResponse> {
    return this.getData(query, Models.movies, fetchPolicy);
  }

  /** Get table of prices for a given cinema */
  public getPrices(query: Query, fetchPolicy?: FetchPolicy): Promise<IPricesResponse> {
    return this.getData(query, Models.prices, fetchPolicy);
  }

  /** Get showtimes for a given movie and cinema */
  public getShowtimes(query: Query, fetchPolicy?: FetchPolicy): Promise<any> {
    return this.getData(query, Models.showtimes, fetchPolicy);
  }

  /** Base get data for all models */
  private getData(query: Query, model: IModel, fetchPolicy: FetchPolicy = FetchPolicy.CACHE_FIRST): Promise<any> {
    // checkForNull(query, 'query');
    checkForNull(model, 'model');

    if (fetchPolicy === FetchPolicy.NETWORK_ONLY) {
      return this.baseGet(query, model);
    }

    if (fetchPolicy === FetchPolicy.CACHE_FIRST) {
      return this.baseCacheFirst(query, model);
    }

    if (fetchPolicy === FetchPolicy.CACHE_ONLY) {
      return this.baseCache(query, model);
    }
  }

  /**
   * Make a GET request with specified query to specified route
   */
  private baseGet(query: Query, model: IModel): Promise<any> {
    return new Promise((resolve, reject) => {
      const queryStr = query ? query.build() : '';
      this.http.get(`${API_URI}/${model.route}${queryStr}`)
        .map((res) => {
          if (res.ok) {
            return res.json();
          } else {
            reject(res);
          }
        })
        .subscribe(({ data }) => {
          // Send data to whom called us directly
          resolve(data);

          // Update local database
          const conditions = query ? this.createConditionsFromQuery(query) : [];
          this.database.delete(model.table, conditions)
            .then(() => {
              const values = this.mapResponseToInsertion(data, model.name);
              const promises = _.map(values, (value) => {
                return this.database.insert(model.table, value);
              });

              Promise.all(promises)
                .then(() => {
                  console.log('All data persisted.');
                  this.database.events.publish(`database:update:${model.table}`, query);
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        });
    });
  }

  private baseCacheFirst(query: Query, model: IModel): Promise<any> {
    if (!this.isDatabaseOpen()) {
      return Promise.reject(new Error('Database is closed!'));
    }

    return new Promise((resolve, reject) => {
      this.baseCache(query, model)
        .then((data) => {
          // If found something send it to the view
          if (data.length !== 0) {
            resolve(data);
          }

          // Now let's fetch data from server
          this.baseGet(query, model);
        })
        .catch(e => reject(e));
    });
  }

  private baseCache(query: Query, model: IModel): Promise<any> {
    if (!this.isDatabaseOpen()) {
      return Promise.reject(new Error('Database is closed!'));
    }

    return new Promise((resolve, reject) => {
      const conditions = query ? this.createConditionsFromQuery(query) : [];
      this.database.findAll(model.table, [], conditions)
        .then((result) => {
          resolve(this.mapResultToModel(result, model.name));
        })
        .catch(e => reject(e));
    });
  }

  private mapResultToModel(data: any[], model: string) {
    checkForNull(data, 'data');
    checkForNull(model, 'model');

    if (!_.isArray(data)) {
      throw new Error('data must be an array.');
    }

    let result: any = {};

    let mapFunc;
    if (model === MOVIES) {
      const movies = _.map(data, mapLocalMovie);
      result.movies = movies;
      if (data.length > 0) {
        result.cinema = data[0].cinema;
      }
    } else if (model === SHOWTIMES) {
      const showtimes = _.map(data, mapLocalShowtime);
      result.showtimes = showtimes;
      if (data.length > 0) {
        result.cinema = data[0].cinema;
        result.period = {
          start: data[0].period_start,
          end: data[0].period_end,
        };
      }
    } else if (model === PRICES) {
      const prices = _.map(data, mapLocalPrice);;
      result.prices = prices;
      if (data.length > 0) {
        result.cinema = data[0].cinema;
        result.website = data[0].website;
      } else {
        result.cinema = '';
        result.website = '';
      }
    }

    return result;
  }

  private mapResponseToInsertion(data: any, model: string) {
    checkForNull(data, 'data');
    checkForNull(model, 'model');

    let result = [];
    if (model === MOVIES) {
      result = _.map(data.movies, (movie, i) => {
        return getMovieInsertionValues(movie);
      });
    } else if (model === SHOWTIMES) {
      result = _.map(data.showtimes, (showtime, i) => {
        return getShowtimeInsertionValues(showtime);
      });
    } else if (model === PRICES) {
      const cinema = data.cinema;
      const website = data.website;
      result = _.map(data.prices, (price, i) => {
        return [
          value('cinema', cinema.toLowerCase()),
          value('website', website),
          value('is2D', price.is2D ? 1 : 0),
          value('value', price.value),
          value('weekdays', price.weekdays.join(';'))
        ];
      });
    }

    return result;
  }

  public isDatabaseOpen(): boolean {
    return this.database.isOpen();
  }

  private fetchPolicyName(fetchPolicy: FetchPolicy): string {
    let result = '';

    switch (fetchPolicy) {
      case FetchPolicy.CACHE_FIRST:
        result = 'cache-first';
        break;

      case FetchPolicy.CACHE_ONLY:
        result = 'cache-only';
        break;

      case FetchPolicy.NETWORK_ONLY:
        result = 'network-only';
        break;

      default:
        throw new Error('Invalid fetch policy');
    }

    return result;
  }

  /**
   * Transforms a query in format:
   *      
   *     ?param1=value1&param2=value2
   * 
   * in conditions like
   * 
   *     param1 = value AND param2 = value2
   *
   * to be used in WHERE clause
   * 
   */
  private createConditionsFromQuery(query: Query): ICondition[] {
    let result: ICondition[] = [];

    const params = query.getFields();
    result = _.map(params, (param, index) => {
      const condition: ICondition = {
        column: param,
        value: query.get(param),
      };

      // The ComparisonOperator.Equal is the only used in this case
      condition.comparisonOperator = ComparisonOperator.EQUAL;

      if (index > 0) {
        condition.operator = Operator.AND;
      }
      return condition;
    });

    return result;
  }
}