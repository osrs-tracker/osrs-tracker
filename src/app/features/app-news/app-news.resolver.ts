import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { NewsItemApp } from 'src/app/services/news/news.service';
import { StorageKey } from 'src/app/services/storage/storage-key';
import { StorageService } from 'src/app/services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppNewsResolver implements Resolve<NewsItemApp[]> {
  constructor(private storageService: StorageService) {}

  resolve(): Promise<NewsItemApp[]> {
    return this.storageService.getValue<NewsItemApp[]>(StorageKey.CacheAppNews, []);
  }
}
