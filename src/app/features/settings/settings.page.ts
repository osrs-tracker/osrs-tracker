import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PreferredXpTrackerView } from 'services/settings/preferred-xp-tracker-view';
import { Settings, SettingsProvider } from 'services/settings/settings';

@Component({
  selector: 'page-settings',
  templateUrl: './settings.page.html',
})
export class SettingsPage implements OnDestroy {
  readonly XpTrackerView = PreferredXpTrackerView;

  settingsSubscription = new Subscription();
  settings: Settings;

  constructor(private settingsProvider: SettingsProvider) {
    this.settingsSubscription.add(this.settingsProvider.settings.subscribe(settings => (this.settings = settings)));
  }

  updateSettings(): void {
    this.settingsProvider.setSettings(this.settings);
  }

  ngOnDestroy(): void {
    this.settingsSubscription.unsubscribe();
  }
}
