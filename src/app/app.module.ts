import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AmenicApp } from './app.component';

import { TabsPage } from '../pages/tabs/tabs';
import { MainPage } from '../pages/main/main';
import { MoviePage } from '../pages/movie/movie';
import { PricesPage } from '../pages/prices/prices';
import { TrailerPage } from '../pages/trailer/trailer';
import { SettingsPage} from '../pages/settings/settings';

import { AdMobFree } from '@ionic-native/admob-free';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { AppPreferences } from '@ionic-native/app-preferences';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Network } from '@ionic-native/network';
import { Push } from '@ionic-native/push';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SQLite } from '@ionic-native/sqlite';

import { ParallaxHeader } from '../components/ParallaxHeader';
import { DataService } from '../service/data';
import { NotificationService } from '../service/notification';
import { YoutubePlayerService } from '../service/ytplayer'; 
import { Database } from '../db';

@NgModule({
  declarations: [
    AmenicApp,
    MainPage,
    MoviePage,
    PricesPage,
    TrailerPage,
    SettingsPage,
    TabsPage,
    ParallaxHeader,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(AmenicApp, {tabsHideOnSubPages: true})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AmenicApp,
    MainPage,
    MoviePage,
    PricesPage,
    TrailerPage,
    SettingsPage,
    TabsPage
  ],
  providers: [
    AdMobFree,
    AndroidFullScreen,
    AppPreferences,
    Database,
    DataService,
    LocalNotifications,
    Network,
    NotificationService,
    Push,
    ScreenOrientation,
    SplashScreen,
    StatusBar,
    SQLite,
    YoutubePlayerService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
