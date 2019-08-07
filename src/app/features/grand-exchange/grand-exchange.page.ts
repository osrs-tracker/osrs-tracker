import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SearchItemComponent } from './components/search-item/search-item.component';

@Component({
  selector: 'page-grand-exchange',
  templateUrl: './grand-exchange.page.html',
})
export class GrandExchangePage {
  @ViewChild(SearchItemComponent, { static: true }) searchItem!: SearchItemComponent;

  cachedItems: { favorites: string[]; recents: string[] };

  constructor(activatedRoute: ActivatedRoute) {
    this.cachedItems = activatedRoute.snapshot.data.cachedItems;
  }

  ionViewWillEnter(): void {
    this.searchItem.updateFavorites();
    this.searchItem.updateRecent();
  }

  doRefresh(event: any): void {
    this.searchItem
      .refresh()
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }
}
