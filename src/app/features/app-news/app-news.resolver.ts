import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { NewsItemApp } from 'services/news/news.service';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppNewsResolver implements Resolve<NewsItemApp[]> {
  constructor(private storageService: StorageService) {}

  resolve(): Promise<NewsItemApp[]> {
    return this.storageService.getValue<NewsItemApp[]>(StorageKey.CacheAppNews, []);
  }
}
