import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { PreferredXpTrackerView } from './preferred-xp-tracker-view';

export interface Settings {
  preferredXpTrackerView: PreferredXpTrackerView;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsProvider {
  settings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(this.initSettings());

  constructor(private storageProvider: StorageService) {}

  async init(): Promise<void> {
    this.settings.next(await this.storageProvider.getValue<Settings>(StorageKey.Settings, this.initSettings()));
  }

  setSettings(settings: Settings): void {
    this.settings.next(settings);
    this.storageProvider.setValue(StorageKey.Settings, this.settings.value);
  }

  get preferredXpTrackerView(): PreferredXpTrackerView {
    return this.settings.value.preferredXpTrackerView;
  }

  set preferredXpTrackerView(preferredXpTrackerView: PreferredXpTrackerView) {
    this.updateSettings<PreferredXpTrackerView>('preferredXpTrackerView', preferredXpTrackerView);
  }

  private updateSettings<T>(setting: string, value: T): void {
    this.settings.next({
      ...this.settings.value,
      [setting]: value,
    });
    this.storageProvider.setValue(StorageKey.Settings, this.settings.value);
  }

  private initSettings(): Settings {
    return {
      preferredXpTrackerView: PreferredXpTrackerView.AdventureLog,
    };
  }
}
