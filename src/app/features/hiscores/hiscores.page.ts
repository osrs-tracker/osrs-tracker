import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SearchHiscoreComponent } from './components/search-hiscore/search-hiscore.component';

@Component({
  selector: 'page-hiscores',
  templateUrl: './hiscores.page.html',
})
export class HiscoresPage {
  @ViewChild(SearchHiscoreComponent, { static: true }) searchHiscore!: SearchHiscoreComponent;

  cachedHiscores: { favorites: string[]; recents: string[] };

  constructor(activatedRoute: ActivatedRoute) {
    this.cachedHiscores = activatedRoute.snapshot.data.cachedHiscores;
  }

  ionViewWillEnter(): void {
    this.searchHiscore.updateFavorites();
    this.searchHiscore.updateRecent();
  }

  doRefresh(event: any): void {
    this.searchHiscore
      .refresh()
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }
}
