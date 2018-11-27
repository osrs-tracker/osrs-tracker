import { Component, ViewChild } from '@angular/core';
import { SearchItemComponent } from './components/search-item/search-item.component';
import { Refresher } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'page-grand-exchange',
  templateUrl: './grand-exchange.page.html'
})
export class GrandExchangePage {

  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(SearchItemComponent) searchItem: SearchItemComponent;

  ionViewWillEnter() {
    this.searchItem.updateFavorites();
    this.searchItem.updateRecent();
  }

  doRefresh() {
    this.searchItem.refresh()
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe();
  }

}