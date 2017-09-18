import { Component } from '@angular/core';

import { MainPage } from '../main/main';
import { PricesPage } from '../prices/prices';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = MainPage;
  tab2Root = PricesPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}
