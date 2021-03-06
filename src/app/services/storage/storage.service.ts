import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { StorageKey } from './storage-key';
import { LimitedCacheOptions } from './storage-options';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly storage = Plugins.Storage;

  async setValue<T>(key: StorageKey, value: T): Promise<T> {
    await this.storage.set({
      key,
      value: JSON.stringify(value),
    });
    return value;
  }

  async getValue<T>(key: StorageKey): Promise<T | null>;
  async getValue<T>(key: StorageKey, defaultValue: T): Promise<T>;
  async getValue<T>(key: StorageKey, defaultValue?: T): Promise<T | null> {
    const found = await this.storage.get({ key });

    if (!found.value) {
      return defaultValue || null;
    }

    const value = JSON.parse(found.value) as T;

    if (defaultValue !== undefined) {
      return value || defaultValue;
    }
    return value;
  }

  /**
   * @returns A promise that resolves to the array with cached values.
   */
  async limitedArrayPush<T>(key: StorageKey, nextValue: T, options: LimitedCacheOptions<T>): Promise<T[]> {
    const values = await this.getValue<T[]>(key).then(value => value || []);
    const isBlacklistedValue = (options.blacklist || []).includes(nextValue);

    if (isBlacklistedValue) {
      return this.setValue(key, values.filter(value => value !== nextValue));
    } else if (!isBlacklistedValue && (options.allowDuplicates || !values.includes(nextValue))) {
      return this.setValue(key, this.prependValue(values, nextValue, options.maxLength));
    } else if (!options.allowDuplicates && values.includes(nextValue)) {
      return this.setValue(key, this.moveValueToFirst(values, nextValue));
    }
    return values;
  }

  async removeFromArray<T>(key: StorageKey, deleteValue: T): Promise<T[]> {
    const values = await this.getValue<T[]>(key).then(value => value || []);

    return this.setValue(key, values.filter(value => value !== deleteValue));
  }

  /**
   * @returns A promise that resolves to a boolean wether the value was added (true) or removed (false).
   */
  async uniqueCacheToggle<T>(key: StorageKey, toggleValue: T): Promise<boolean> {
    let cache = await this.getValue<T[]>(key).then(values => values || []);
    const wasToggled = cache.includes(toggleValue);

    if (wasToggled) {
      cache = cache.filter(value => value !== toggleValue);
    } else {
      cache = [toggleValue, ...cache];
    }

    await this.setValue(key, cache);

    return !wasToggled;
  }

  private moveValueToFirst<T>(values: T[], firstValue: T): T[] {
    values = values.filter(value => value !== firstValue);
    return this.prependValue(values, firstValue);
  }

  private prependValue<T>(values: T[], nextValue: T, maxLength?: number): T[] {
    if (maxLength && values.length > maxLength - 1) {
      values = values.slice(0, -1);
    }
    return [nextValue, ...values];
  }
}
