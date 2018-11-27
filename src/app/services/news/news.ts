import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeHttp } from 'core/native-http/nativeHttp';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import xml2js from 'xml2js';
import { StorageProvider } from '../storage/storage';

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
  ) { }
}

export class NewsItemOSRS {
  constructor(
    public title: string,
    public pubDate: Date,
    public link: string,
    public description: string,
    public enclosure: {
      link: string,
      type: string
    },
    public categories: string[],
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class NewsProvider {

  constructor(
    private http: HttpClient,
    private nativeHttp: NativeHttp,
    private storageProvider: StorageProvider
  ) { }

  getOSRSNews(): Observable<NewsItemOSRS[]> {
    // OLD because no HTTPS available for the rss feed.
    return this.nativeHttp.getText(`${environment.API_RUNESCAPE_OLD}/m=news/latest_news.rss?oldschool=true`)
      .pipe(map(text => {
        let json = null;
        xml2js.parseString(text, (err, result) => {
          json = result.rss.channel[0].item;
        });
        return json.map(item => new NewsItemOSRS(
          item.title[0],
          item.pubDate[0],
          item.link[0],
          item.description[0].trim(),
          {
            link: item.enclosure[0].$.url,
            type: item.enclosure[0].$.type
          },
          item.category
        )).slice(0, 10);
      }));
  }

  getAppNews(uuid, offset = 0): Observable<NewsItemApp[]> {
    return this.http.get<NewsItemApp[]>(`${environment.API_GEPT}/news`, { params: { uuid: uuid, offset: `${offset}` } });
  }

  getAppNewsItem(id, uuid): Observable<NewsItemApp> {
    return this.http.get<NewsItemApp>(`${environment.API_GEPT}/news/${id}`, { params: { uuid: uuid } });
  }

  upvoteAppNews(newsId, uuid) {
    return this.http.post(`${environment.API_GEPT}/news/upvote`, {
      newsId: newsId,
      uuid: uuid
    }).pipe(mergeMap(() => {
      return this.getAppNewsItem(newsId, uuid);
    }));
  }

  downvoteAppNews(newsId, uuid) {
    return this.http.post(`${environment.API_GEPT}/news/downvote`, {
      newsId: newsId,
      uuid: uuid
    }).pipe(mergeMap(() => this.getAppNewsItem(newsId, uuid)));
  }

  isNewAppArticleAvailable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storageProvider.getAppNews(items => {
        if (!items) {
          resolve(true);
        } else {
          this.getAppNews(null).subscribe(newItems => {
            resolve(newItems[0].id > items[0].id);
          });
        }
      });
    });
  }

}
