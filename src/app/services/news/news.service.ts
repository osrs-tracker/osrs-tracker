import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NativeHttp } from 'src/app/core/native-http/nativeHttp';
import { environment } from 'src/environments/environment';
import { ElementCompact, xml2js } from 'xml-js';
import { StorageKey } from '../storage/storage-key';
import { StorageService } from '../storage/storage.service';

export class NewsItemApp {
  constructor(
    public id: number,
    public title: string,
    public date: Date,
    public category: string,
    public content: string,
    public upvotes: number,
    public downvotes: number,
    public vote: number
  ) {}
}

export class NewsItemOSRS {
  constructor(
    public title: string,
    public pubDate: Date,
    public link: string,
    public description: string,
    public enclosure: {
      link: string;
      type: string;
    },
    public categories: string[]
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  constructor(private httpClient: HttpClient, private nativeHttp: NativeHttp, private storageService: StorageService) {}

  getOSRSNews(): Observable<NewsItemOSRS[]> {
    return this.nativeHttp.getText(`${environment.API_RUNESCAPE}/m=news/latest_news.rss?oldschool=true`).pipe(
      map(xmlRss => {
        const xml: ElementCompact = xml2js(xmlRss, { compact: true });
        return xml.rss.channel.item.map(
          (item: ElementCompact) =>
            new NewsItemOSRS(
              item.title._text,
              item.pubDate._text,
              item.link._text,
              item.description._text,
              {
                link: item.enclosure._attributes.url,
                type: item.enclosure._attributes.type,
              },
              [item.category._text]
            )
        );
      }),
      tap(news => this.storageService.setValue(StorageKey.CacheOsrsNews, news))
    );
  }

  getAppNews(uuid: string | null = null, offset: number = 0): Observable<NewsItemApp[]> {
    return this.httpClient.get<NewsItemApp[]>(`${environment.API_GEPT}/news`, {
      params: {
        uuid: uuid || '',
        offset: `${offset}`,
      },
    });
  }

  getAppNewsItem(id: number, uuid: string): Observable<NewsItemApp> {
    return this.httpClient.get<NewsItemApp>(`${environment.API_GEPT}/news/${id}`, { params: { uuid } });
  }

  upvoteAppNews(newsId: number, uuid: string): Observable<NewsItemApp> {
    return this.httpClient
      .post(`${environment.API_GEPT}/news/upvote`, { newsId, uuid })
      .pipe(switchMap(() => this.getAppNewsItem(newsId, uuid)));
  }

  downvoteAppNews(newsId: number, uuid: string): Observable<NewsItemApp> {
    return this.httpClient
      .post(`${environment.API_GEPT}/news/downvote`, { newsId, uuid })
      .pipe(switchMap(() => this.getAppNewsItem(newsId, uuid)));
  }

  async isNewAppArticleAvailable(): Promise<boolean> {
    const appNews = await this.storageService.getValue<NewsItemApp[]>(StorageKey.CacheAppNews);

    return new Promise(resolve => {
      if (!appNews) {
        resolve(true);
      } else {
        this.getAppNews().subscribe({
          next: newItems => resolve(newItems[0].id > appNews[0].id),
          error: () => resolve(false),
        });
      }
    });
  }
}
