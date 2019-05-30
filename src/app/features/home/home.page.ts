import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NewsItemOSRS } from 'services/news/news.service';
import { OSRSNewsComponent } from './components/osrs-news/osrs-news.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
})
export class HomePage implements AfterViewInit {
  cachedNewsItems: NewsItemOSRS[];

  constructor(activatedRoute: ActivatedRoute) {
    this.cachedNewsItems = activatedRoute.snapshot.data.cachedNewsItems;
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => Plugins.SplashScreen.hide());
  }

  doRefresh(event: any, news: OSRSNewsComponent): void {
    forkJoin(timer(500), news.getNews())
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }
}
