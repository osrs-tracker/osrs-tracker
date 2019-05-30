import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { environment } from 'environments/environment';
import { forkJoin, Observable, timer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { NewsItemApp, NewsService } from 'services/news/news.service';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Component({
  selector: 'page-app-news',
  templateUrl: 'app-news.page.html',
  styleUrls: ['./app-news.page.scss'],
  encapsulation: ViewEncapsulation.None, // needed for innerHTML styling
})
export class AppNewsPage implements OnInit {
  uuid: string;
  items: NewsItemApp[];
  originalItems: NewsItemApp[];
  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private newsProvider: NewsService,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    this.items = this.activatedRoute.snapshot.data.cachedNewsItems;
  }

  async ngOnInit(): Promise<void> {
    this.uuid = environment.production ? (await Plugins.Device.getInfo()).uuid : 'test';
    this.getNews().subscribe();
  }

  getNews(): Observable<NewsItemApp[]> {
    this.loading = true;
    return this.newsProvider.getAppNews(this.uuid).pipe(
      finalize(() => (this.loading = false)),
      tap(items => {
        this.items = items;
        this.originalItems = items.map(item => ({ ...item }));
        this.storageService.setValue(StorageKey.CacheAppNews, items);
        this.replaceNewsLinks();
      })
    );
  }

  upvote(id: number): void {
    const item = this.items.find(newsItem => newsItem.id === id)!;
    this.offlineUpvoteLogic(item);
    this.newsProvider.upvoteAppNews(id, this.uuid).subscribe(
      newsItem => Object.assign(item, newsItem),
      () => {
        Object.assign(item, this.originalItems.find(newsItem => newsItem.id === id));
        this.voteErrorToast();
      }
    );
  }

  downvote(id: number): void {
    const item = this.items.find(newsItem => newsItem.id === id)!;
    this.offlineDownvoteLogic(item);
    this.newsProvider.downvoteAppNews(id, this.uuid).subscribe(
      newsItem => Object.assign(item, newsItem),
      () => {
        Object.assign(item, this.originalItems.find(newsItem => newsItem.id === id));
        this.voteErrorToast();
      }
    );
  }

  doRefresh(event: any): void {
    forkJoin([timer(500), this.getNews()])
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }

  doInfinite(event: any): void {
    if (this.loading === false) {
      this.loading = true;
      this.newsProvider
        .getAppNews(this.uuid, this.items.length)
        .pipe(
          finalize(() => {
            this.loading = false;
            event.target.complete();
          })
        )
        .subscribe(
          items => {
            if (items.length === 0) {
              return (event.target.disabled = true);
            }
            this.items = [...this.items, ...items];
            this.originalItems = [...this.originalItems, ...items.map(item => ({ ...item }))];
            if (items.length < 5) {
              event.target.disabled = true;
            }
          },
          () => (event.target.disabled = true)
        );
    }
  }

  trackByNewsItemId(index: number, newsItem: NewsItemApp): number {
    return newsItem.id;
  }

  private replaceNewsLinks(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(el => {
      el.onclick = (event: Event) => {
        event.preventDefault();
        Plugins.Browser.open({
          url: el.href,
          toolbarColor: '#1e2023',
        });
      };
    });
  }

  private async voteErrorToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Failed to process vote. Check your internet connection.',
      duration: 3000,
    });
    await toast.present();
  }

  private offlineUpvoteLogic(item: NewsItemApp): void {
    if (item.vote === 1) {
      item.upvotes--;
    } else if (!item.vote) {
      item.upvotes++;
    } else if (item.vote === -1) {
      item.upvotes++;
      item.downvotes--;
    }
    item.vote = item.vote === 1 ? 0 : 1;
  }

  private offlineDownvoteLogic(item: NewsItemApp): void {
    if (item.vote === 1) {
      item.upvotes--;
      item.downvotes++;
    } else if (!item.vote) {
      item.downvotes++;
    } else if (item.vote === -1) {
      item.downvotes--;
    }
    item.vote = item.vote === -1 ? 0 : -1;
  }
}
