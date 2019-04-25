import { Component } from '@angular/core';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OSRSNewsComponent } from './components/osrs-news/osrs-news.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
})
export class HomePage {
  doRefresh(event: any, news: OSRSNewsComponent): void {
    forkJoin(timer(500), news.getNews())
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }
}
