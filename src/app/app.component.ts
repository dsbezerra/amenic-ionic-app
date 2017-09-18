import { Component, ViewChild } from '@angular/core';
import { Events, Nav, Platform } from 'ionic-angular';
import { Push } from '@ionic-native/push';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';

import { TabsPage } from '../pages/tabs/tabs';
import { DataService } from '../service/data';
import { NotificationService } from '../service/notification';

@Component({
  templateUrl: 'app.html',
  providers: [DataService]
})
export class AmenicApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = TabsPage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    push: Push,
    sqlite: SQLite,
    events: Events,
    dataService: DataService,
    notService: NotificationService,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      // Hide splash screen
      splashScreen.hide();

      // Initialize data service
      dataService.init(sqlite, events);

      // Initialize push notification service
      notService.init();
    });
  }
}
