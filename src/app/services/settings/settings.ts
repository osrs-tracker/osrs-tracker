import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { XpTrackerView } from './xp-tracker-view';

export interface Settings {
  preferredXpTrackerView?: XpTrackerView;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsProvider {

  settings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(this.initSettings());

  constructor(
    private storageProvider: StorageService,
  ) { }

  init(): Promise<void> {
    return this.storageProvider.getValue<Settings>(StorageKey.Settings, this.initSettings())
      .then(settings => this.settings.next(settings));
  }

  setSettings(settings: Settings) {
    this.settings.next(settings);
    this.storageProvider.setValue(StorageKey.Settings, this.settings.value);
  }

  get preferredXpTrackerView() {
    return this.settings.value.preferredXpTrackerView;
  }

  set preferredXpTrackerView(preferredXpTrackerView: XpTrackerView) {
    this.updateSettings<XpTrackerView>('preferredXpTrackerView', preferredXpTrackerView);
  }

  private updateSettings<T>(setting: string, value: T) {
    this.settings.next({
      ...this.settings.value,
      [setting]: value
    });
    this.storageProvider.setValue(StorageKey.Settings, this.settings.value);
  }

  private initSettings(): Settings {
    return {
      preferredXpTrackerView: XpTrackerView.AdventureLog
    };
  }

}
