import { Component, Input, OnInit } from '@angular/core';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NewsItemOSRS, NewsService } from 'services/news/news.service';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Component({
  selector: 'osrs-news',
  templateUrl: './osrs-news.component.html',
  styleUrls: ['./osrs-news.component.scss'],
})
export class OSRSNewsComponent implements OnInit {
  @Input() cachedNewsItems: NewsItemOSRS[];
  items: NewsItemOSRS[];

  constructor(
    private browserTab: BrowserTab,
    private inAppBrowser: InAppBrowser,
    private newsProvider: NewsService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.items = this.cachedNewsItems;
    this.getNews().subscribe();
  }

  getNews(): Observable<NewsItemOSRS[]> {
    return this.newsProvider.getOSRSNews().pipe(
      tap(items => {
        this.items = items;
        this.storageService.setValue(StorageKey.CacheOsrsNews, items);
      })
    );
  }

  async openInBrowser(url: string): Promise<void> {
    if (await this.browserTab.isAvailable()) {
      this.browserTab.openUrl(url);
    } else {
      this.inAppBrowser.create(url, '_system');
    }
  }

  trackByNewsItemDate(index: number, newsItem: NewsItemOSRS): Date {
    return newsItem.pubDate;
  }
}
