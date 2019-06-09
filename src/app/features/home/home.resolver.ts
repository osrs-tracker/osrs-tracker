import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { NewsItemOSRS } from 'src/app/services/news/news.service';
import { StorageKey } from 'src/app/services/storage/storage-key';
import { StorageService } from 'src/app/services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class HomeResolver implements Resolve<NewsItemOSRS[]> {
  constructor(private storageService: StorageService) {}

  resolve(): Promise<NewsItemOSRS[]> {
    return this.storageService.getValue<NewsItemOSRS[]>(StorageKey.CacheOsrsNews, []);
  }
}
