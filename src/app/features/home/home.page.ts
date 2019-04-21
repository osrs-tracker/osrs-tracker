import { Component, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OSRSNewsComponent } from './components/osrs-news/osrs-news.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
})
export class HomePage {
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(OSRSNewsComponent) news: OSRSNewsComponent;

  doRefresh(): void {
    forkJoin(timer(500), this.news.getNews())
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe();
  }
}
