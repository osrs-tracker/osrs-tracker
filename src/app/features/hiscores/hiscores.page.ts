import { Component, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { SearchHiscoreComponent } from './components/search-hiscore/search-hiscore.component';

@Component({
  selector: 'page-hiscores',
  templateUrl: './hiscores.page.html',
})
export class HiscoresPage {
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(SearchHiscoreComponent) searchHiscore: SearchHiscoreComponent;

  ionViewWillEnter(): void {
    this.searchHiscore.updateFavorites();
    this.searchHiscore.updateRecent();
  }

  doRefresh(): void {
    this.searchHiscore
      .refresh()
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe();
  }
}
