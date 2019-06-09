import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AlertManager } from 'src/app/services/alert-manager/alert.manager';
import { SearchXpComponent } from './components/search-xp/search-xp.component';

@Component({
  selector: 'page-xp-tracker',
  templateUrl: 'xp-tracker.page.html',
})
export class XpTrackerPage {
  @ViewChild(SearchXpComponent, { static: true }) searchXp: SearchXpComponent;

  cachedXp: { favorites: string[]; recents: string[] };

  constructor(activatedRoute: ActivatedRoute, private alertManager: AlertManager) {
    this.cachedXp = activatedRoute.snapshot.data.cachedXp;
  }

  ionViewWillEnter(): void {
    this.searchXp.updateFavorites();
    this.searchXp.updateRecent();
  }

  doRefresh(event: any): void {
    this.searchXp
      .refresh()
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }

  openHelp(): void {
    this.alertManager.create({
      header: 'Help',
      subHeader: 'What is XP Tracker?',
      message: `
                The XP Tracker is a feature that will track daily XP gains.<br><br>
                We will check the hiscores every night at 00:00 UTC.<br><br>
                We start tracking players after they have been looked up for the first time.
                `,
      buttons: ['OK'],
    });
  }
}
