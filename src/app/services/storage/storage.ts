import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ItemSearchModel } from '../item/item.model';
import { NewsItemApp, NewsItemOSRS } from '../news/news';
import { Settings } from '../settings/settings';

export const STORAGE_KEY = {
  FAVORITE_ITEMS: 'favoriteItems',
  RECENT_ITEMS: 'recentItems',

  FAVORITE_HISCORES: 'favoriteHiscores',
  RECENT_HISCORES: 'recentHiscores',

  FAVORITE_XP: 'favoriteXp',
  RECENT_XP: 'recentXp',

  CACHE_OSRS_NEWS: 'osrsNews',
  CACHE_APP_NEWS: 'appNews',
  CACHE_ITEMS: 'items',

  SETTINGS: 'settings'
};

type FavoritesCallback = (favorites: string[]) => any;
type RecentCallback = (recents: string[]) => any;

@Injectable({
  providedIn: 'root'
})
export class StorageProvider {

  constructor(
    private storage: Storage,
  ) { }

  private setValue(key: string, value: any, callback?): Promise<void> {
    return this.storage.ready()
      .then(storage => {
        if (callback instanceof Function) {
          callback();
        }
        return storage.setItem(key, value).then(() => undefined);
      });
  }

  private getValue<T>(key: string, callback?): Promise<T> {
    return this.storage.ready()
      .then(storage =>
        storage.getItem(key).then((value: any) => {
          if (callback instanceof Function) {
            callback(value);
          }
          return <T>value;
        })
      );
  }

  private limitedArrayAdd(key: string, value: string, maxLength: number) {
    value = value.toLowerCase();
    this.getValue(key, (values: string[]) => {
      values = values || [];
      if (!values.includes(value)) {
        if (values.length > (maxLength - 1)) {
          values.pop();
        }
        this.setValue(key, [value, ...values]);
      } else {
        values = values.filter(recent => recent !== value);
        this.setValue(key, [value, ...values]);
      }
    });
  }

  private uniqueArrayAdd(key: string, value: string, isFavorite: (isFavorite: boolean) => boolean) {
    value = value.toLowerCase();
    this.getValue(key, (values: string[]) => {
      values = values || [];
      if (isFavorite(!values.includes(value))) {
        this.setValue(key, ([...values, value].sort()));
      } else {
        values = values.filter(favorite => favorite !== value);
        this.setValue(key, values);
      }
    });
  }

  removeFromArray(key: string, oldValue: string) {
    return new Promise((resolve, reject) => {
      this.getValue(key, (values: string[]) => {
        values = values || [];
        values = values.filter(value => value.toLowerCase() !== oldValue.toLowerCase());
        this.setValue(key, values);
        resolve();
      });
    });
  }

  async getSettings(): Promise<Settings> {
    return await this.storage.ready().then(storage =>
      storage.getItem(STORAGE_KEY.SETTINGS)
    );
  }
  setSettings(settings: Settings): void {
    this.setValue(STORAGE_KEY.SETTINGS, settings);
  }

  getOSRSNews(callback: (news: NewsItemOSRS[]) => void): void {
    this.getValue(STORAGE_KEY.CACHE_OSRS_NEWS, callback);
  }
  setOSRSNews(news: NewsItemOSRS[]): void {
    this.setValue(STORAGE_KEY.CACHE_OSRS_NEWS, news);
  }
  getAppNews(callback: (news: NewsItemApp[]) => void): void {
    this.getValue(STORAGE_KEY.CACHE_APP_NEWS, callback);
  }
  setAppNews(news: NewsItemApp[]): void {
    this.setValue(STORAGE_KEY.CACHE_APP_NEWS, news);
  }

  addItemToCache(itemId: number, item: ItemSearchModel) {
    this.getValue(STORAGE_KEY.CACHE_ITEMS, items => {
      items = items || {};
      items[itemId] = {
        name: item.name,
        description: item.description
      };
      this.setValue(STORAGE_KEY.CACHE_ITEMS, items);
    });
  }
  getItemFromCache(itemId: string): Promise<ItemSearchModel> {
    return new Promise(resolve => {
      this.getValue(STORAGE_KEY.CACHE_ITEMS, items => resolve((items || {})[itemId]));
    });
  }

  getItems(favoriteCallback: FavoritesCallback, recentCallback: RecentCallback): void {
    this.getValue(STORAGE_KEY.FAVORITE_ITEMS, favoriteCallback);
    this.getValue(STORAGE_KEY.RECENT_ITEMS, recentCallback);
  }

  getFavoriteItems(callback: FavoritesCallback): void {
    this.getValue(STORAGE_KEY.FAVORITE_ITEMS, callback);
  }

  getRecentItems(callback: RecentCallback): void {
    this.getValue(STORAGE_KEY.RECENT_ITEMS, callback);
  }

  addToRecentItems(itemId: string): void {
    this.limitedArrayAdd(STORAGE_KEY.RECENT_ITEMS, itemId, 5);
  }

  addToFavoriteItems(itemId: string, isFavorite: (isFavorite: boolean) => boolean): void {
    this.uniqueArrayAdd(STORAGE_KEY.FAVORITE_ITEMS, itemId, isFavorite);
  }

  getHiscores(favoriteCallback: FavoritesCallback, recentCallback: RecentCallback): void {
    this.getValue(STORAGE_KEY.FAVORITE_HISCORES, favoriteCallback);
    this.getValue(STORAGE_KEY.RECENT_HISCORES, recentCallback);
  }

  getFavoriteHiscores(callback: FavoritesCallback): void {
    this.getValue(STORAGE_KEY.FAVORITE_HISCORES, callback);
  }

  getRecentHiscores(callback: RecentCallback): void {
    this.getValue(STORAGE_KEY.RECENT_HISCORES, callback);
  }

  addToRecentHiscores(username: string): void {
    this.limitedArrayAdd(STORAGE_KEY.RECENT_HISCORES, username, 5);
  }

  addToFavoriteHiscores(username: string, isFavorite: (isFavorite: boolean) => boolean): void {
    this.uniqueArrayAdd(STORAGE_KEY.FAVORITE_HISCORES, username, isFavorite);
  }

  getXp(favoriteCallback: FavoritesCallback, recentCallback: RecentCallback): void {
    this.getValue(STORAGE_KEY.FAVORITE_XP, favoriteCallback);
    this.getValue(STORAGE_KEY.RECENT_XP, recentCallback);
  }

  getFavoriteXp(callback: FavoritesCallback): void {
    this.getValue(STORAGE_KEY.FAVORITE_XP, callback);
  }

  getRecentXp(callback: RecentCallback): void {
    this.getValue(STORAGE_KEY.RECENT_XP, callback);
  }

  addToRecentXp(username: string): void {
    this.limitedArrayAdd(STORAGE_KEY.RECENT_XP, username, 5);
  }

  addToFavoriteXp(username: string, isFavorite: (isFavorite: boolean) => boolean): void {
    this.uniqueArrayAdd(STORAGE_KEY.FAVORITE_XP, username, isFavorite);
  }

}
