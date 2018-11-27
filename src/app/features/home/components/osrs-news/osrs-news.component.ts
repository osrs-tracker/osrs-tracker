import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { NewsItemOSRS, NewsProvider } from 'services/news/news';
import { StorageProvider } from 'services/storage/storage';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'osrs-news',
  templateUrl: './osrs-news.component.html',
  styleUrls: ['./osrs-news.component.scss']
})
export class OSRSNewsComponent implements OnInit {

  items: NewsItemOSRS[];

  constructor(
    private browserTab: BrowserTab,
    private inAppBrowser: InAppBrowser,
    private newsProvider: NewsProvider,
    private storageProvider: StorageProvider
  ) { }

  ngOnInit() {
    this.storageProvider.getOSRSNews(items => {
      this.items = items || [];
      this.getNews().subscribe();
    });
  }

  getNews(): Observable<NewsItemOSRS[]> {
    return this.newsProvider.getOSRSNews()
      .pipe(tap(items => {
        this.items = items;
        this.storageProvider.setOSRSNews(items);
      }));
  }

  openInBrowser(url: string) {
    this.browserTab.isAvailable()
      .then(isAvailabe => {
        if (isAvailabe) {
          this.browserTab.openUrl(url);
        } else {
          this.inAppBrowser.create(url, '_system');
        }
      });
  }

  trackByNewsItemDate(index: number, newsItem: NewsItemOSRS) {
    return newsItem.pubDate;
  }

}
