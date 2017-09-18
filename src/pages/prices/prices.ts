import { Component, ViewChild } from '@angular/core';
import { Content, Events, NavController, ToastController } from 'ionic-angular';

import { DataService, FetchPolicy } from '../../service/data';
import { PricesQuery } from '../../service/query';

import { getNameForWeekday } from '../../models/movie';

import * as _ from 'lodash';

@Component({
  selector: 'page-prices',
  templateUrl: 'prices.html'
})
export class PricesPage {
  @ViewChild(Content) content: Content;

  private toast: any;
  // @Temp
  private prices: any = {
    ibicinemas: {
      isFetching: false,
      website: '',
      data: {
        '2d': [],
        '3d': [],
      },
      hasData: false,
    },
    cinemais: {
      isFetching: false,
      website: '',
      data: {
        '2d': [],
        '3d': [],
      },
      hasData: false,
    }
  };

  constructor(
    public navCtrl: NavController,
    public events: Events,
    private toastCtrl: ToastController,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    // Fetch from database if is already open
    if (this.dataService.isDatabaseOpen()) {
      this.refetch();
    } else {
      // If not, subscribe to ready event and fetch when it's opened
      this.events.subscribe('database:ready', () => {
        this.refetch();
      });
    }

    this.events.subscribe('database:update:prices', (query: PricesQuery) => {
      const cinema = query.get('cinema');
      this.fetchPrices(cinema, true);
      this.showToast('Preços atualizados');
    });
  }

  private refetch(cache: boolean = false) {
    this.showToast('Atualizando preços...');
    this.fetchPrices('cinemais', cache);
    this.fetchPrices('ibicinemas', cache);
  }

  private fetchPrices(cinema: string, cache: boolean) {
    // Show spinner only if we are loading directly from network and there's no local data
    this.prices[cinema].isFetching = !cache && !this.prices[cinema].hasData;

    const query = new PricesQuery()
      .cinema(cinema);

    this.dataService.getPrices(query, cache ? FetchPolicy.CACHE_ONLY : FetchPolicy.CACHE_FIRST)
      .then(data => {
        this.prices[cinema] = {
          isFetching: false,
          data: this.groupByImage(data.prices),
          website: data.website,
          hasData: data.prices.length !== 0,
        }
      })
      .catch(e => console.log(e));
  }

  public getWeekdaysText(weekdays: number[]) {
    if (weekdays.length === 0) {
      return '';
    }

    const texts = [];
    weekdays.forEach((weekday) => {
      texts.push(getNameForWeekday(weekday));
    });

    return texts.join(', ');
  }

  public formatPrice(price) {
    let text = price.toFixed(2);
    text = text.replace(/\./, ',')
    return `R$ ${text}`;
  }

  private groupByImage(prices: any[]) {

    if (prices.length === 0) {
      return {
        '2d': [],
        '3d': [],
      };
    }

    const grouped = _.groupBy(prices, (item) => {
      const key = item.is2D ? '2d' : '3d';
      return key;
    });

    return grouped;
  }

  private showToast(message: string) {
    if (!this.toast) {
      this.toast = this.toastCtrl.create({
        message,
        duration: 2000,
        position: 'top',
        dismissOnPageChange: true,
      });

      this.toast.onDidDismiss(() => {
        this.toast = null;
      });

      this.toast.present();
    } else {
      this.toast.data.message = message;
    }
  }
  
  private scrollToTop() {
    this.content.scrollToTop();
  }
}
