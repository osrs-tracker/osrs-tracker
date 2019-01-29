import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeHttp } from 'core/native-http/nativeHttp';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { xml2js, ElementCompact, } from 'xml-js';

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
    private storageService: StorageService
  ) { }

  getOSRSNews(): Observable<NewsItemOSRS[]> {
    // OLD because no HTTPS available for the rss feed.
    return this.nativeHttp.getText(`${environment.API_RUNESCAPE_OLD}/m=news/latest_news.rss?oldschool=true`)
      .pipe(map(xmlRss => {
        const xml: ElementCompact = xml2js(xmlRss, { compact: true, });
        return xml.rss.channel.item.map(item => new NewsItemOSRS(
          item.title._text,
          item.pubDate._text,
          item.link._text,
          item.description._text,
          {
            link: item.enclosure._attributes.url,
            type: item.enclosure._attributes.type
          },
          [item.category._text]
        ));
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

  async isNewAppArticleAvailable(): Promise<boolean> {
    const appNews = await this.storageService.getValue<NewsItemApp[]>(StorageKey.CacheAppNews);

    return new Promise(resolve => {
      if (!appNews) {
        resolve(true);
      } else {
        this.getAppNews(null).subscribe(newItems => {
          resolve(newItems[0].id > appNews[0].id);
        }, () => resolve(false));
      }
    });
  }

}
