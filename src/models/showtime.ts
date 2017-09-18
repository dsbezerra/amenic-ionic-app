import { value } from '../db/table';

/** Showtime model */
export interface IShowtime {
  movieId: string;
  isSubbed: boolean;
  isDubbed: boolean;
  availableIn2D: boolean;
  availableIn3D: boolean;
  national: boolean;
  time: string;
  room: number;
  weekday: number;
  cinema: string;
  period: {
    start: string;
    end: string;
  }
}

/** Local showtime */
export interface ILocalShowtime {
  movie: string;
  isSubbed: number;
  isDubbed: number;
  availableIn2D: number;
  availableIn3D: number;
  national: number;
  time: string;
  room: number;
  weekday: number;s
  cinema: string;
  period_start: string;
  period_end: string;
}

/** Maps local showtime to model */
export const mapLocalShowtime = (localShowtime: ILocalShowtime, index?: number): IShowtime => {
  const result: IShowtime = {
    movieId: localShowtime.movie,
    isSubbed: localShowtime.isSubbed === 1,
    isDubbed: localShowtime.isDubbed === 1,
    availableIn2D: localShowtime.availableIn2D === 1,
    availableIn3D: localShowtime.availableIn3D === 1,
    national: localShowtime.national === 1,
    time: localShowtime.time,
    room: localShowtime.room,
    weekday: localShowtime.weekday,
    cinema: localShowtime.cinema,
    period: {
      start: localShowtime.period_start,
      end: localShowtime.period_end,
    }
  };

  return result;
}

export const getShowtimeInsertionValues = (showtime) => {
  const values = [
    value('id', showtime.id),
    value('period_start', showtime.period.start),
    value('period_end', showtime.period.end),
    value('movie', showtime.movieId),
    value('isSubbed', showtime.isSubbed ? 1 : 0),
    value('isDubbed', showtime.isDubbed ? 1 : 0),
    value('availableIn2D', showtime.availableIn2D ? 1 : 0),
    value('availableIn3D', showtime.availableIn3D ? 1 : 0),
    value('national', showtime.national ? 1 : 0),
    value('time', showtime.time),
    value('room', showtime.room),
    value('weekday', showtime.weekday),
    value('cinema', showtime.cinema),
  ];
  return values;
}
