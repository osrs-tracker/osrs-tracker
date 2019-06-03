import { Component, Input, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NewsItemOSRS, NewsService } from 'services/news/news.service';

@Component({
  selector: 'osrs-news',
  templateUrl: './osrs-news.component.html',
  styleUrls: ['./osrs-news.component.scss'],
})
export class OSRSNewsComponent implements OnInit {
  @Input() cachedNewsItems: NewsItemOSRS[];
  items: NewsItemOSRS[];

  constructor(private newsProvider: NewsService) {}

  ngOnInit(): void {
    this.items = this.cachedNewsItems;
  }

  getNews(): Observable<NewsItemOSRS[]> {
    return this.newsProvider.getOSRSNews().pipe(tap(items => (this.items = items)));
  }

  async openInBrowser(url: string): Promise<void> {
    Plugins.Browser.open({ url, toolbarColor: '#1e2023' });
  }

  trackByNewsItemDate(index: number, newsItem: NewsItemOSRS): Date {
    return newsItem.pubDate;
  }
}
