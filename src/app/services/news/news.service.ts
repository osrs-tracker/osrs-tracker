import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
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
    ) { }
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
    ) { }
}

@Injectable({
    providedIn: 'root',
})
export class NewsService {
    constructor(private httpClient: HttpClient, private storageService: StorageService) { }

    getOSRSNews(): Observable<NewsItemOSRS[]> {
        return this.httpClient.get<NewsItemOSRS[]>(`${environment.API_OSRS_TRACKER}/proxy/news`)
            .pipe(tap(news => this.storageService.setValue(StorageKey.CacheOsrsNews, news)));
    }

    getAppNews(uuid: string | null = null, offset: number = 0): Observable<NewsItemApp[]> {
        return this.httpClient.get<NewsItemApp[]>(`${environment.API_OSRS_TRACKER}/news`, {
            params: {
                uuid: uuid || '',
                offset: `${offset}`,
            },
        });
    }

    getAppNewsItem(id: number, uuid: string): Observable<NewsItemApp> {
        return this.httpClient.get<NewsItemApp>(`${environment.API_OSRS_TRACKER}/news/${id}`, { params: { uuid } });
    }

    upvoteAppNews(newsId: number, uuid: string): Observable<NewsItemApp> {
        return this.httpClient
            .post(`${environment.API_OSRS_TRACKER}/news/upvote`, { newsId, uuid })
            .pipe(switchMap(() => this.getAppNewsItem(newsId, uuid)));
    }

    downvoteAppNews(newsId: number, uuid: string): Observable<NewsItemApp> {
        return this.httpClient
            .post(`${environment.API_OSRS_TRACKER}/news/downvote`, { newsId, uuid })
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
