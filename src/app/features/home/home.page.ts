import { Component, OnInit, ViewChild } from '@angular/core';
import { Refresher } from '@ionic/angular';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OSRSNewsComponent } from './components/osrs-news/osrs-news.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
})
export class HomePage implements OnInit {

  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(OSRSNewsComponent) news: OSRSNewsComponent;

  constructor() { }

  ngOnInit() {
    this.news.getNews();
  }

  doRefresh() {
    forkJoin(
      timer(500),
      this.news.getNews()
    ).pipe(
      finalize(() => this.refresher.complete())
    ).subscribe();
  }

}
