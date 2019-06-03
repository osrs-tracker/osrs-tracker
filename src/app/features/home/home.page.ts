import { Component, ViewChild } from '@angular/core';
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
export class HomePage {
  cachedNewsItems: NewsItemOSRS[];
  @ViewChild(OSRSNewsComponent) osrsNewsComponent: OSRSNewsComponent;

  constructor(activatedRoute: ActivatedRoute) {
    this.cachedNewsItems = activatedRoute.snapshot.data.cachedNewsItems;
  }

  ionViewDidEnter(): void {
    Plugins.SplashScreen.hide();
    this.osrsNewsComponent.getNews().subscribe();
  }

  doRefresh(event: any): void {
    forkJoin([timer(500), this.osrsNewsComponent.getNews()])
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }
}
