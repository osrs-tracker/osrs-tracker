import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { Device } from '@ionic-native/device/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonInfiniteScroll, IonRefresher, ToastController } from '@ionic/angular';
import { environment } from 'environments/environment';
import { forkJoin, Observable, timer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { NewsItemApp, NewsProvider } from 'services/news/news';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Component({
  selector: 'page-app-news',
  templateUrl: 'app-news.page.html',
  styleUrls: ['./app-news.page.scss'],
  encapsulation: ViewEncapsulation.None, // needed for innerHTML styling
})
export class AppNewsPage implements OnInit {
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  uuid: string;
  items: NewsItemApp[];
  originalItems: NewsItemApp[];
  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private browserTab: BrowserTab,
    private device: Device,
    private inAppBrowser: InAppBrowser,
    private newsProvider: NewsProvider,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    this.items = this.activatedRoute.snapshot.data.cachedNewsItems;
  }

  async ngOnInit(): Promise<void> {
    this.uuid = environment.production ? this.device.uuid : 'test';
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

  doRefresh(): void {
    forkJoin(timer(500), this.getNews())
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe();
  }

  doInfinite(): void {
    if (this.loading === false) {
      this.loading = true;
      this.newsProvider
        .getAppNews(this.uuid, this.items.length)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.infiniteScroll.complete();
          })
        )
        .subscribe(
          items => {
            if (items.length === 0) {
              return (this.infiniteScroll.disabled = true);
            }
            this.items = [...this.items, ...items];
            this.originalItems = [...this.originalItems, ...items.map(item => ({ ...item }))];
            if (items.length < 5) {
              this.infiniteScroll.disabled = true;
            }
          },
          () => (this.infiniteScroll.disabled = true)
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
        this.browserTab.isAvailable().then(isAvailabe => {
          if (isAvailabe) {
            this.browserTab.openUrl(el.href);
          } else {
            this.inAppBrowser.create(el.href, '_system');
          }
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
