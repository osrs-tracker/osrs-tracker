import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NewsItemOSRS, NewsService } from 'src/app/services/news/news.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
})
export class HomePage {
  newsItems: NewsItemOSRS[];

  constructor(activatedRoute: ActivatedRoute, private newsService: NewsService) {
    this.newsItems = activatedRoute.snapshot.data.cachedNewsItems;
    this.newsService.getOSRSNews().subscribe(newsItems => (this.newsItems = newsItems));
  }

  ionViewDidEnter(): void {
    Plugins.SplashScreen.hide();
  }

  doRefresh(event: any): void {
    forkJoin([this.newsService.getOSRSNews(), timer(500)])
      .pipe(finalize(() => event.target.complete()))
      .subscribe(([newsItems]) => (this.newsItems = newsItems));
  }
}
