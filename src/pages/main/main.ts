import { Component, ViewChild } from '@angular/core';
import { Network } from '@ionic-native/network';

import {
  Content,
  Events,
  NavController,
  ToastController,
  ViewController,
} from 'ionic-angular';

import { DataService, FetchPolicy } from '../../service/data';
import { MoviesQuery } from '../../service/query';
import { MoviePage } from '../movie/movie';
import { PricesPage } from '../prices/prices';
import { SettingsPage } from '../settings/settings';

import { IMovie } from '../../models/movie';
import { mapArrayToGrid } from '../../util/grid';
import { parseDate, formatPeriodDate } from '../../util/time';
import * as StringUtil from '../../util/string';

import * as moment from 'moment';

@Component({
  templateUrl: 'main.html',
  selector: 'page-main',
})
export class MainPage {
  @ViewChild(Content) content: Content;

  /** Stores the list of in theaters movies */
  inTheaters: IMovie[] = [];
  inTheatersGrid: any[] = [];
  isFetchingInTheaters: boolean = false;

  /** Stores the list of coming soon movies */
  comingSoon: IMovie[] = [];
  comingSoonGrid: any[] = [];
  isFetchingComingSoon: boolean = false;

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public events: Events,
    private network: Network,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    // Fetch from database if is already open
    if (this.dataService.isDatabaseOpen()) {
      this.refetch();
    } else {
      // If not, subscribe to ready event and fetch when opened
      this.events.subscribe('database:ready', () => {
        this.refetch();
      });
    }

    // Subscribe to changes in table movies
    this.events.subscribe('database:update:movies', (query: MoviesQuery) => {
      if (query.get('isInTheaters')) {
        this.fetchInTheaters(true);
      } else if (query.get('isComingSoon')) {
        this.fetchComingSoon(true);
      }
    });
  }

  private refetch(cache: boolean = false) {
    this.fetchInTheaters(cache);
    this.fetchComingSoon(cache);
  }

  private fetchComingSoon(cache: boolean) {
    this.isFetchingComingSoon = !cache;
    const query = new MoviesQuery()
      .isComingSoon(true);

    this.dataService.getMovies(query, cache ? FetchPolicy.CACHE_ONLY : FetchPolicy.CACHE_FIRST)
      .then(data => {
        this.comingSoon = data.movies;
        this.comingSoonGrid = mapArrayToGrid(data.movies);
        this.isFetchingComingSoon = false;
      })
      .catch(e => console.log(e));
  }

  private fetchInTheaters(cache: boolean, cinema?: string) {
    this.isFetchingInTheaters = !cache;

    const query = new MoviesQuery()
      .isInTheaters(true);
    this.dataService.getMovies(query, cache ? FetchPolicy.CACHE_ONLY : FetchPolicy.CACHE_FIRST)
      .then(data => {
        this.inTheaters = data.movies.map((movie) => {
          return {
            ...movie,
            cinemas: movie.cinemas.map(cinema => StringUtil.capitalize(cinema)),
          };
        })
        this.inTheatersGrid = mapArrayToGrid(this.inTheaters);
        this.isFetchingInTheaters = false;
      })
      .catch(e => console.log(e));
  }

  private presentToast(message: string, duration: number = 1000) {
    const toast = this.toastCtrl.create({
      message,
      duration,
    });
    toast.present();
  }

  public parseDate(date: string): string {
    return parseDate(new Date(date), true);
  }

  public getCinemasText(movie: any): string {
    return movie.cinemas.join(', ');
  }

  public goToPage(name: string, payload?: any): void {
    switch (name) {
      case 'movie':
        if (!payload) throw new Error('Movie data must be defined.');

        this.navCtrl.push(MoviePage, {
          movie: payload,
        });
        break;

      default:
        break;
    }
  }

  private scrollToTop() {
    this.content.scrollToTop();
  }
}
