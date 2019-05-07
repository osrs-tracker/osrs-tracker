import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
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

  constructor(activatedRoute: ActivatedRoute, private splashScreen: SplashScreen) {
    this.cachedNewsItems = activatedRoute.snapshot.data.cachedNewsItems;
  }

  ngAfterViewInit(): void {
    setTimeout(() => requestAnimationFrame(() => this.splashScreen.hide()), 1000);
  }

  doRefresh(event: any, news: OSRSNewsComponent): void {
    forkJoin(timer(500), news.getNews())
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }
}
