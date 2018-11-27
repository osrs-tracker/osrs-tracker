import { Component, ViewChild } from '@angular/core';
import { Refresher } from '@ionic/angular';
import { SearchHiscoreComponent } from './components/search-hiscore/search-hiscore.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'page-hiscores',
  templateUrl: './hiscores.page.html',
})
export class HiscoresPage {

  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(SearchHiscoreComponent) searchHiscore: SearchHiscoreComponent;

  ionViewWillEnter() {
    this.searchHiscore.updateFavorites();
    this.searchHiscore.updateRecent();
  }

  doRefresh() {
    this.searchHiscore.refresh().pipe(
      finalize(() => this.refresher.complete())
    ).subscribe();
  }

}
