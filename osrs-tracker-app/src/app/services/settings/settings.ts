import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageProvider } from '../storage/storage';
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
    private storageProvider: StorageProvider,
  ) { }

  init(): Promise<void> {
    return this.storageProvider.getSettings().then(settings => {
      this.settings.next(settings || this.initSettings());
    });
  }

  setSettings(settings: Settings) {
    this.settings.next(settings);
    this.storageProvider.setSettings(this.settings.value);
  }

  get preferredXpTrackerView() {
    return this.settings.value.preferredXpTrackerView;
  }

  set preferredXpTrackerView(preferredXpTrackerView: XpTrackerView) {
    this.updateSettings<XpTrackerView>('preferredXpTrackerView', preferredXpTrackerView);
  }

  private updateSettings<T>(setting: string, value: T) {
    this.settings.next(Object.assign(this.settings, <Settings>{
      [setting]: value
    }));
    this.storageProvider.setSettings(this.settings.value);
  }

  private initSettings(): Settings {
    return {
      preferredXpTrackerView: XpTrackerView.AdventureLog
    };
  }

}
