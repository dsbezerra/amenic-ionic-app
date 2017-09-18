interface IParams {
  [name: string]: string;
}

export abstract class Query {
  /** Query Parameters Map */
  private params: IParams;

  constructor() {
    this.params = {};
  }

  // Put a parameter
  protected put(name: string, value: string): void {
    if (this.params) {
      this.params[name] = value;
    }
  };

  // Get parameters
  public getFields(): string[] {
    return Object.keys(this.params);
  }

  // Get parameters
  public get(field: string): any {
    return this.params[field];
  }

  // Builds the query string
  public build(): string {
    let query = '?';
    
    const names = Object.keys(this.params);
    const length = names.length;
    for (let i = 0; i < length; i++) {
      const name = names[i];
      const value = this.params[name];
      
      if (i === length - 1) {
        query += `${name}=${value}`;
      } else {
        query += `${name}=${value}&`
      }
    }

    return query;
  }
}

export class MoviesQuery extends Query {
  public cinema = (name: string): MoviesQuery => {
    this.put('cinema', name);
    return this;
  }

  public isInTheaters = (value: boolean): MoviesQuery => {
    this.put('isInTheaters', value ? 'true' : 'false');
    return this;
  }

  public isComingSoon = (value: boolean): MoviesQuery => {
    this.put('isComingSoon', value ? 'true' : 'false');
    return this;
  }
}

export class PricesQuery extends Query {
  public cinema = (name: string): PricesQuery => {
    this.put('cinema', name);
    return this;
  }
}

export class ShowtimeQuery extends Query {
  public cinema = (name: string): ShowtimeQuery => {
    this.put('cinema', name);
    return this;
  }

  public movie = (index: number): ShowtimeQuery => {
    this.put('movie', String(index));
    return this;
  }
} 

