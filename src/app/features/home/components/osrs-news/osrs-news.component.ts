import { Component, OnInit } from '@angular/core';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NewsItemOSRS, NewsProvider } from 'services/news/news';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Component({
  selector: 'osrs-news',
  templateUrl: './osrs-news.component.html',
  styleUrls: ['./osrs-news.component.scss'],
})
export class OSRSNewsComponent implements OnInit {
  items: NewsItemOSRS[];

  constructor(
    private browserTab: BrowserTab,
    private inAppBrowser: InAppBrowser,
    private newsProvider: NewsProvider,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    this.items = await this.storageService.getValue<NewsItemOSRS[]>(StorageKey.CacheOsrsNews, []);
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

  async openInBrowser(url: string) {
    if (await this.browserTab.isAvailable()) {
      this.browserTab.openUrl(url);
    } else {
      this.inAppBrowser.create(url, '_system');
    }
  }

  trackByNewsItemDate(index: number, newsItem: NewsItemOSRS) {
    return newsItem.pubDate;
  }
}
