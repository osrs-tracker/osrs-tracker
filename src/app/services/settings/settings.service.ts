import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageKey } from '../storage/storage-key';
import { StorageService } from '../storage/storage.service';
import { PreferredXpTrackerView } from './preferred-xp-tracker-view';

export interface Settings {
  preferredXpTrackerView: PreferredXpTrackerView;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  settings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(this.initSettings());

  constructor(private settingsService: StorageService) {}

  async init(): Promise<void> {
    const settings = await this.settingsService.getValue<Settings>(StorageKey.Settings, this.initSettings());
    this.settings.next(settings);
  }

  setSettings(settings: Settings): void {
    this.settings.next(settings);
    this.settingsService.setValue(StorageKey.Settings, this.settings.value);
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
    this.settingsService.setValue(StorageKey.Settings, this.settings.value);
  }

  private initSettings(): Settings {
    return {
      preferredXpTrackerView: PreferredXpTrackerView.AdventureLog,
    };
  }
}
