import { Component, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { SearchItemComponent } from './components/search-item/search-item.component';

@Component({
  selector: 'page-grand-exchange',
  templateUrl: './grand-exchange.page.html',
})
export class GrandExchangePage {
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(SearchItemComponent) searchItem: SearchItemComponent;

  ionViewWillEnter() {
    this.searchItem.updateFavorites();
    this.searchItem.updateRecent();
  }

  doRefresh() {
    this.searchItem
      .refresh()
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe();
  }
}
