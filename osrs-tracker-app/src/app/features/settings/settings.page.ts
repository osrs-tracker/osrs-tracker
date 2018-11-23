import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings, SettingsProvider } from 'services/settings/settings';
import { XpTrackerView } from 'services/settings/xp-tracker-view';

@Component({
  selector: 'page-settings',
  templateUrl: './settings.page.html'
})
export class SettingsPage implements OnDestroy {

  readonly XpTrackerView = XpTrackerView;

  settingsSubscription = new Subscription();
  settings: Settings;

  constructor(
    private settingsProvider: SettingsProvider
  ) {
    this.settingsSubscription.add(
      this.settingsProvider.settings.subscribe(settings => this.settings = settings)
    );
  }

  updateSettings() {
    this.settingsProvider.setSettings(this.settings);
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

}
