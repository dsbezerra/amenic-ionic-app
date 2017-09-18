import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Events,
  NavController,
  NavParams,
  Slides,
} from 'ionic-angular';

import { DataService, FetchPolicy } from '../../service/data';
import { TrailerPage } from '../trailer/trailer';
import { getNameForWeekday } from '../../models/movie';

import { ShowtimeQuery } from '../../service/query';

import { parseDate, getNameOfMonth } from '../../util/time';

import { AdMobFree } from '@ionic-native/admob-free';
import { AD_DEFAULT_CONFIG } from '../../util/ad';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'page-movie',
  templateUrl: 'movie.html',
})
export class MoviePage {
  @ViewChild(Slides) slides: Slides;

  private movie: any;

  private currHours: number;
  private currMinutes: number;

  private isReleased: boolean = false;
  private isFetchingShowtimes: boolean = false;

  trustedVideoUrl: any;

  private start: number;
  private end: number;

  // Initial state of weekdays, should not be mutable
  private weekdaysOriginal: any = null;

  private weekdays: any = {};
  private weekdaysLabels: any[] = [];
  private currentWeekday: string = '';

  constructor(
    public navCtrl: NavController,
    public events: Events,
    private navParams: NavParams,
    private sanitizer: DomSanitizer,
    private dataService: DataService,
    private admobFree: AdMobFree,
  ) {
    this.movie = this.navParams.get('movie');
    this.isReleased = !this.movie.releaseDate;
    this.trustedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getTrailerVideo());

    this.setupWeekdays();
  }

  ngOnInit() {
    // Fetch showtimes only if the movie is already released
    if (this.isReleased) {
      // Fetch from database if is already open
      if (this.dataService.isDatabaseOpen()) {
        this.refetch();
      } else {
        // If not, subscribe to ready event and fetch when opened
        this.events.subscribe('database:ready', () => {
          this.refetch();
        });
      }

      // Subscribe to changes in table showtimes
      this.events.subscribe('database:update:showtimes', (query: ShowtimeQuery) => {
        this.fetchShowtimes(true);
      });
    }

    // Setup admob
    this.admobFree.banner.config(AD_DEFAULT_CONFIG);
    this.admobFree.banner.prepare()
      .then(() => console.log('Ad ready.'))
      .catch(err => console.log(err));

    // Delay iframe loading to avoid slowdown at page enter
    // _.delay(() => {
    //   (document.getElementById('ytplayer') as any).src = this.getTrailerVideo();
    // }, 500);
  }

  slideWillChange() {
    let currentIndex = this.slides.getActiveIndex();
    this.currentWeekday = Object.keys(this.weekdays)[currentIndex];
  }

  slideTo(weekday) {
    const index = Object.keys(this.weekdays).indexOf(weekday);
    if (index > -1) {
      this.slides.slideTo(index, 200);
    }
  }

  ionViewDidLoad() {
    const currDate = new Date();
    // Save hours and minutes
    this.currHours = currDate.getHours();
    this.currMinutes = currDate.getMinutes();
  }

  ionViewWillLeave() {
    this.admobFree.banner.hide();
  }

  private setupWeekdays() {
    const today = new Date();
    const weekday = today.getDay();

    this.currentWeekday = 'weekday-' + weekday;

    const daysToCreate = weekday < 4 ? (3 - weekday) : (4 + 7 - 1) - weekday;
    this.weekdays['weekday-' + weekday] = {
      label: 'Hoje',
      date: moment(),
      showtimes: {
        cinemais: [],
        ibicinemas: [],
      },
    };

    for (let i = 1; i <= daysToCreate; i++) {
      const nextDate = moment().add(i, 'days');

      let label = '';
      if (i === 1) {
        label = 'Amanhã';
      } else {
        label = this.getNameForWeekday(nextDate.day() + 1, true)
        label = label.toLocaleLowerCase() + ' ' + nextDate.date() + " " + getNameOfMonth(nextDate.month(), true)
      }

      this.weekdays['weekday-' + nextDate.day()] = {
        label,
        date: nextDate,
        showtimes: {
          'cinemais': [],
          'ibicinemas': [],
        },
      };
    }

    this.weekdaysLabels = _.map(Object.keys(this.weekdays), key => {
      const item = this.weekdays[key];
      return {
        key,
        label: item.label,
      }
    });

    this.weekdaysOriginal = _.cloneDeep(this.weekdays);
  }

  private refetch(cache: boolean = false) {
    this.fetchShowtimes(cache);
  }

  private fetchShowtimes(cache: boolean) {
    this.isFetchingShowtimes = !cache;

    const { id } = this.movie;
    const query = new ShowtimeQuery()
      .movie(id);

    this.dataService.getShowtimes(query, cache ? FetchPolicy.CACHE_ONLY : FetchPolicy.CACHE_FIRST)
      .then(data => {
        this.weekdays = this.groupByWeekdays(data.showtimes);
        this.isFetchingShowtimes = false;
        // Remove weekdays that doesn't have any showtime
        // if (this.movie.showtimes.cinemais.isFetched && this.movie.showtimes.ibicinemas.isFetched) {
        //   const keys = Object.keys(this.weekdays);
        //   const keysToDelete = [];
        //   for (let i = 0; i < keys.length; i++) {
        //     let key = keys[i];
        //     if (this.weekdays[key].showtimes.cinemais.length === 0 &&
        //       this.weekdays[key].showtimes.ibicinemas.length === 0) {
        //         delete this.weekdays[key];
        //     }
        //   }

        //   const newKeys = Object.keys(this.weekdays);
        //   this.weekdaysLabels = _.map(newKeys, key => {
        //     const item = this.weekdays[key];
        //     return {
        //       key,
        //       label: item.label,
        //     }
        //   });

        //   if (newKeys.length !== 0 && keys.length !== newKeys.length) {
        //     this.currentWeekday = newKeys[0];
        //   }
        // }
      })
      .catch(e => console.log(e));
  }

  public getTrailerVideo(): string {
    if (!this.movie || !this.movie.trailer) return '';
    return (
      `${this.movie.trailer}?rel=0&controls=0&showinfo=0&;iv_load_policy=3&;theme=light&modestbranding=1&autohide=1`
    );
  }

  public getGenresText(): string {
    if (!this.movie || !this.movie.genres || this.movie.genres.length === 0) {
      return '';
    }

    let text = '';
    for (let i = 0; i < this.movie.genres.length; i++) {
      text += this.movie.genres[i];
      if (i + 1 < this.movie.genres.length) {
        text += ', ';
      }
    }
    return text;
  }

  public getRatingImage() {
    if (!this.movie) {
      return '';
    }

    const { rating } = this.movie;
    if (rating === -1) {
      return './assets/images/L.png';
    } else {
      return `./assets/images/${rating}.png`
    }
  }

  public getRatingText() {
    if (!this.movie) {
      return '';
    }

    const { rating } = this.movie;
    switch (rating) {
      case -1:
        return 'Livre para todas as idades'
      case 18:
        return 'Proibido para menores de 18 anos';
      default:
        return `Não recomendado para menores de ${rating} anos`
    }
  }

  public getReleaseText() {
    const date = new Date(this.movie.releaseDate);
    return 'Estreia: ' + parseDate(date);
  }

  public seeTrailer() {
    if (!this.movie) {
      return;
    }

    this.navCtrl.push(TrailerPage, {
      trailer: this.movie.trailer,
    });
  }

  public isSessionOpen(time: string): boolean {
    let result = false;
    if (!time) {
      return result;
    }

    const parts = time.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);

      /* 
        Show as active even if it passed some minutes 
        TODO: Use date to compare here
      */
      result = this.currHours < hours || this.currHours === hours && this.currMinutes <= minutes + 5;
    }

    return result;
  }

  public getRoomText(showtime, withRoom: boolean = false) {
    let text = '';
    if (withRoom) {
      text = `Sala ${showtime.room}, `;
    }

    text += `${this.getNameForAudioVersion(showtime)}${this.getNameForVideoVersion(showtime)}`;
    return text;
  }

  public getWeekdaysText(weekdays) {
    const weekdaysInText = [];
    if (weekdays.length > 0) {
      weekdays.forEach((weekday) => {
        weekdaysInText.push(this.getNameForWeekday(weekday));
      });

      return weekdaysInText.join(', ');
    }

    return weekdaysInText;
  }

  public getNameForWeekday(weekday, abbr: boolean = true) {
    return getNameForWeekday(weekday, abbr);
  }

  public getNameForVideoVersion(showtime) {
    let result = '';

    if (showtime.availableIn2D) {
      result = '2D';
    } else if (showtime.availableIn3D) {
      result = '3D';
    }

    return result;
  }

  public getNameForAudioVersion(showtime, abbr: boolean = false) {
    let result = '';

    if (showtime.isSubbed) {
      result = abbr ? 'Leg.' : 'Legendado, ';
    } else if (showtime.isDubbed) {
      result = abbr ? 'Dub.' : 'Dublado, ';
    } /*else if (showtime.national) {
      result = abbr ? 'Nac.' : 'Nacional,';
    }*/

    return result;
  }

  // Group every showtime by weekdays then by versions
  public groupByWeekdays(arr: any[]) {
    // Create a brand new weekdays object to make sure we are starting with the desired initial state for weekdays
    const weekdays = _.cloneDeep(this.weekdaysOriginal);

    const keys = Object.keys(weekdays);
    arr.forEach((showtime) => {
      if (showtime.weekday === 0) {
        // Push to all weeekdays available
        keys.forEach(key => weekdays[key].showtimes[showtime.cinema].push(showtime));
      } else {
        // Create key from weekday
        const key = `weekday-${showtime.weekday}`;
        weekdays[key].showtimes[showtime.cinema].push(showtime);
      }
    });

    // Group by version and audio every showtime in each weekday for each cinema
    keys.forEach((key) => {
      let weekday = weekdays[key];
      let cinemas = Object.keys(weekday.showtimes);
      cinemas.forEach((cinema) => {
        let grouped = _.groupBy(weekday.showtimes[cinema], (item) => {
          let audio = item.isSubbed ? 'sub' : 'dub';
          if (item.national) {
            audio = 'nat';
          }
          let image = item.availableIn2D ? '2d' : '3d';
          return `${audio}-${image}`;
        });

        let groups = _.keys(grouped);
        let newArr = _.map(groups, (group) => {
          let showtimes = grouped[group];
          let times = showtimes.map(showtime => showtime.time);
          let description = this.getRoomText(showtimes[0]);

          if (description == "") {
            console.log("Empty description showtime: ");
            console.log(showtimes);
          }

          return {
            description,
            times,
          }
        });

        weekdays[key].showtimes[cinema] = newArr;
      })
    });

    return weekdays;
  }

  private isShowtimeEqual(first, second): boolean {
    if (!first) {
      return false;
    }

    return (
      first.isSubbed === second.isSubbed &&
      first.isDubbed === second.isDubbed &&
      first.availableIn2D === second.availableIn2D &&
      first.availableIn3D === second.availableIn3D
    );
  }
}
