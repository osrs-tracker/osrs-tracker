import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { StorageKey } from './storage-key';
import { LimitedCacheOptions } from './storage-options';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage
  ) { }

  setValue<T>(key: StorageKey, value: T): Promise<T> {
    return this.storage.ready()
      .then(storage => storage.setItem<T>(key, value));
  }

  getValue<T>(key: StorageKey): Promise<T> {
    return this.storage.ready()
      .then(storage => storage.getItem<T>(key));
  }

  /**
   * @returns A promise that resolves to the array with cached values.
   */
  async limitedArrayPush<T>(key: StorageKey, nextValue: T, options: LimitedCacheOptions<T>): Promise<T[]> {
    let values = await this.getValue<T[]>(key).then(value => value || []);
    const isBlacklistedValue = (options.blacklist || []).includes(nextValue);

    if (!isBlacklistedValue && (options.allowDuplicates || !values.includes(nextValue))) {
      if (values.length > (options.maxLength - 1)) {
        values.pop();
      }
      values = [nextValue, ...values];
      return this.setValue<T[]>(key, values);
    } else if (!options.allowDuplicates && values.includes(nextValue)) {
      // if value exists, put it on top
      values = values.filter(value => value !== nextValue);
      values = [nextValue, ...values];
      return this.setValue<T[]>(key, values);
    }
    return values;
  }

  async removeFromArray<T>(key: StorageKey, deleteValue: T): Promise<T[]> {
    let values = await this.getValue<T[]>(key).then(value => value || []);

    values = values.filter(value => value !== deleteValue);

    return this.setValue<T[]>(key, values);
  }

  /**
   * @returns A promise that resolves to a boolean wether the value was added (true) or removed (false).
   */
  async uniqueCacheToggle<T>(key: StorageKey, toggleValue: T): Promise<boolean> {
    let cache = await this.getValue<T[]>(key).then(values => values || []);
    const wasToggled = cache.includes(toggleValue);

    if (wasToggled) {
      cache = cache.filter(value => value === toggleValue);
    } else {
      cache.push(toggleValue);
    }

    await this.setValue<T[]>(key, cache);

    return !wasToggled;
  }


}
