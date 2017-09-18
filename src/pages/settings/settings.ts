import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { AppPreferences } from '@ionic-native/app-preferences';

import * as _ from 'lodash';

// Keys
const NOTIFICATIONS_UPDATES: string = 'notifications:updates';
const NOTIFICATIONS_PREMIERES: string = 'notifications:premieres';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  private settings = {
    notifications: {
      updates: false,
      premieres: false,
    }
  }

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    private appPreferences: AppPreferences,
  ) {
    this.init();
  }

  private init() {    
    // TODO: Restore preferences and update UI
  }

  private onChange(input: string, key: string, event: any) {
    switch (input) {
      case 'checkbox': this.update(key, event.checked); break;
      default:
        console.log('Unknown input value %s', input);
        break;
    }
  }

  private update(key: string, value: any) {
    if (!key) {
      return;
    }

    this.appPreferences.store(key, key, value)
      .then(() => console.log('stored successfully!'))
      .catch(err => console.log(err));
  }
}
