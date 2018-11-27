import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { InfiniteScroll, Refresher, ToastController } from '@ionic/angular';
import { forkJoin, Observable, timer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { NewsItemApp, NewsProvider } from 'services/news/news';
import { StorageProvider } from 'services/storage/storage';
import { Device } from '@ionic-native/device/ngx';
import { environment } from 'environments/environment';

@Component({
  selector: 'page-app-news',
  templateUrl: 'app-news.page.html',
  styleUrls: ['./app-news.page.scss'],
  encapsulation: ViewEncapsulation.None // needed for innerHTML styling
})
export class AppNewsPage implements OnInit {
  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

  uuid: string;
  items: NewsItemApp[];
  originalItems: NewsItemApp[];
  loading = false;

  constructor(
    private device: Device,
    private newsProvider: NewsProvider,
    private storageProvider: StorageProvider,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.uuid = environment.production ? this.device.uuid : 'test';
    this.storageProvider.getAppNews(items => {
      this.items = items || [];
      this.getNews().subscribe();
    });
  }

  getNews(): Observable<NewsItemApp[]> {
    this.loading = true;
    return this.newsProvider.getAppNews(this.uuid).pipe(
      finalize(() => this.loading = false),
      tap(items => {
        this.items = items;
        this.originalItems = items.map(item => Object.assign({}, item));
        this.storageProvider.setAppNews(items);
      })
    );
  }

  private async voteErrorToast() {
    const toast = await this.toastController.create({
      message: 'Failed to process vote. Check your internet connection.',
      duration: 3000
    });
    toast.present();
  }

  upvote(id) {
    const item = this.items.find(newsItem => newsItem.id === id);
    this.offlineUpvoteLogic(item);
    this.newsProvider.upvoteAppNews(id, this.uuid).subscribe(
      newsItem => Object.assign(item, newsItem),
      err => {
        Object.assign(item, this.originalItems.find(newsItem => newsItem.id === id));
        this.voteErrorToast();
      });
  }

  downvote(id) {
    const item = this.items.find(newsItem => newsItem.id === id);
    this.offlineDownvoteLogic(item);
    this.newsProvider.downvoteAppNews(id, this.uuid).subscribe(
      newsItem => Object.assign(item, newsItem),
      err => {
        Object.assign(item, this.originalItems.find(newsItem => newsItem.id === id));
        this.voteErrorToast();
      });
  }

  doRefresh() {
    forkJoin(
      timer(500),
      this.getNews()
    ).pipe(
      finalize(() => this.refresher.complete())
    ).subscribe();
  }

  doInfinite() {
    if (this.loading === false) {
      this.loading = true;
      this.newsProvider.getAppNews(this.uuid, this.items.length)
        .pipe(finalize(() => {
          this.loading = false;
          this.infiniteScroll.complete();
        }))
        .subscribe(items => {
          if (items.length === 0) {
            return this.infiniteScroll.disabled = true;
          }
          this.items = [...this.items, ...items];
          this.originalItems = [...this.originalItems, ...items.map(item => Object.assign({}, item))];
          if (items.length < 5) {
            this.infiniteScroll.disabled = true;
          }
        }, () => this.infiniteScroll.disabled = true);
    }
  }

  trackByNewsItemId(index: number, newsItem: NewsItemApp) {
    return newsItem.id;
  }

  private offlineUpvoteLogic(item: NewsItemApp) {
    if (item.vote === 1) {
      item.upvotes--;
    } else if (!item.vote) {
      item.upvotes++;
    } else if (item.vote === -1) { item.upvotes++; item.downvotes--; }
    item.vote = item.vote === 1 ? 0 : 1;
  }

  private offlineDownvoteLogic(item: NewsItemApp) {
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
