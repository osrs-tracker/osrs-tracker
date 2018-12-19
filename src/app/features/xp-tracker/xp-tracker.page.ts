import { Component, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { SearchXpComponent } from './components/search-xp/search-xp.component';

@Component({
  selector: 'page-xp-tracker',
  templateUrl: 'xp-tracker.page.html'
})
export class XpTrackerPage {

  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(SearchXpComponent) searchXp: SearchXpComponent;

  constructor(
    private alertManager: AlertManager
  ) { }

  ionViewWillEnter() {
    this.searchXp.updateFavorites();
    this.searchXp.updateRecent();
  }

  doRefresh() {
    this.searchXp.refresh().pipe(
      finalize(() => this.refresher.complete())
    ).subscribe();
  }

  openHelp() {
    this.alertManager.create({
      header: 'Help',
      subHeader: 'What is XP Tracker?',
      message: `
                The XP Tracker is a feature that will track daily XP gains.<br><br>
                We will check the hiscores every night at 00:00 UTC.<br><br>
                We start tracking players after they have been looked up for the first time.
                `,
      buttons: ['OK']
    });
  }

}
