import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PreferredXpTrackerView } from 'src/app/services/settings/preferred-xp-tracker-view';
import { Settings, SettingsService } from 'src/app/services/settings/settings.service';

@Component({
  selector: 'page-settings',
  templateUrl: './settings.page.html',
})
export class SettingsPage implements OnDestroy {
  readonly XpTrackerView = PreferredXpTrackerView;

  settingsSubscription = Subscription.EMPTY;
  settings!: Settings;

  constructor(private settingsProvider: SettingsService) {
    this.settingsSubscription = this.settingsProvider.settings.subscribe({
      next: settings => (this.settings = settings),
    });
  }

  updateSettings(): void {
    this.settingsProvider.setSettings(this.settings);
  }

  ngOnDestroy(): void {
    this.settingsSubscription.unsubscribe();
  }
}
