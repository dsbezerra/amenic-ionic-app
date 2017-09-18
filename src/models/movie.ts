import { value } from '../db/table';

export enum Weekday {
  ALL,
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  HOLIDAY,
  PREMIERE,
}

export interface IMovie {
  id: string;
  title: string;
  poster: string;
  plot: string;
  trailer: string;
  genres: string[];
  rating?: number;
  runtime?: number;
  studio: string;
  releaseDate?: string;
  cinemas: string[];
  isInTheaters: boolean;
  isComingSoon: boolean;
}

export interface ILocalMovie {
  id: string;
  title: string;
  poster: string;
  plot: string;
  trailer: string;
  genres: string;
  rating?: number;
  runtime?: number;
  studio: string;
  releaseDate?: string;
  cinemas?: string;
  isInTheaters: boolean;
  isComingSoon: boolean;
}

export const getNameForWeekday = (weekday, abbr: boolean = false) => {
  let result = '';

  if (weekday === Weekday.ALL) {
    result = 'Todos os dias';
  } else if (weekday === Weekday.SUNDAY) {
    result = abbr ? 'Dom.' : 'Domingo';
  } else if (weekday === Weekday.MONDAY) {
    result = abbr ? 'Seg.' : 'Segunda';
  } else if (weekday === Weekday.TUESDAY) {
    result = abbr ? 'Ter.' : 'Terça';
  } else if (weekday === Weekday.WEDNESDAY) {
    result = abbr ? 'Qua.' : 'Quarta';
  } else if (weekday === Weekday.THURSDAY) {
    result = abbr ? 'Qui.' : 'Quinta';
  } else if (weekday === Weekday.FRIDAY) {
    result = abbr ? 'Sex.' : 'Sexta';
  } else if (weekday === Weekday.SATURDAY) {
    result = abbr ? 'Sáb.' : 'Sábado';
  } else if (weekday === Weekday.HOLIDAY) {
    result = 'Feriados';
  } else if (weekday === Weekday.PREMIERE) {
    result = 'Pré-Estreia'
  }

  return result;
}

export const getMovieInsertionValues = (movie: IMovie) => {
  const values = [
    value('id', movie.id),
    value('title', movie.title),
    value('poster', movie.poster),
    value('plot', movie.plot),
    value('trailer', movie.trailer),
    value('genres', movie.genres.join(';')),
    value('isComingSoon', movie.isComingSoon),
    value('isInTheaters', movie.isInTheaters),
    value('rating', movie.rating),
    value('runtime', movie.runtime),
    value('studio', movie.studio),
    value('releaseDate', movie.releaseDate),
    value('cinemas', movie.cinemas.join(';')),
  ];
  return values;
}

export const mapLocalMovie = (localMovie: ILocalMovie, index?: number): IMovie => {
  const result: IMovie = {
    id: localMovie.id,
    title: localMovie.title,
    poster: localMovie.poster,
    plot: localMovie.plot,
    trailer: localMovie.trailer,
    genres: localMovie.genres.split(';'),
    isInTheaters: localMovie.isInTheaters,
    isComingSoon: localMovie.isComingSoon,
    rating: localMovie.rating,
    runtime: localMovie.runtime,
    studio: localMovie.studio,
    releaseDate: localMovie.releaseDate,
    cinemas: localMovie.cinemas.split(";"),
  };

  return result;
}
