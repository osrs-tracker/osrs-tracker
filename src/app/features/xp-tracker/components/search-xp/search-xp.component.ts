import { Component, Input, ViewChildren } from '@angular/core';
import { NavController, IonList } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { XpTrackerRoute } from 'features/xp-tracker/hiscores.routes';
import { forkJoin, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { XpFavoriteComponent } from '../xp-favorite/xp-favorite.component';

@Component({
  selector: 'search-xp',
  templateUrl: 'search-xp.component.html',
  styleUrls: ['./search-xp.component.scss']
})
export class SearchXpComponent {

  @Input() favorites = true;
  @Input() recents = true;

  @ViewChildren(XpFavoriteComponent) xpFavoriteComponents: XpFavoriteComponent[];
  favoriteXp: string[] = [];
  recentXp: string[] = [];

  constructor(
    private alertManger: AlertManager,
    private navCtrl: NavController,
    private storageService: StorageService,
  ) {
    this.updateFavorites();
    this.updateRecent();
  }

  updateFavorites(list?: IonList) {
    this.storageService.getValue<string[]>(StorageKey.FavoriteXp)
      .then(favorites => this.favoriteXp = favorites)
      .then(() => list && list.closeSlidingItems());
  }

  updateRecent(list?: IonList) {
    this.storageService.getValue<string[]>(StorageKey.RecentXp)
      .then(favorites => this.recentXp = favorites)
      .then(() => list && list.closeSlidingItems());
  }

  refresh() {
    return forkJoin([timer(500), ...(this.xpFavoriteComponents || []).map(fav => fav.getData())]);
  }

  removeFavorite(username: string) {
    this.storageService.removeFromArray(StorageKey.FavoriteXp, username)
      .then(() => this.updateFavorites());
  }

  removeRecent(username: string) {
    this.storageService.removeFromArray(StorageKey.RecentXp, username)
      .then(() => this.updateFavorites());
  }

  async searchXp(playerName: string) {
    playerName = playerName.trim();
    if (playerName.length > 0) {
      this.navCtrl.navigateForward([AppRoute.XpTracker, XpTrackerRoute.View, playerName])
        .catch(() => this.alertManger.create({
          header: 'Player not found',
          buttons: ['OK']
        }));
    } else {
      this.alertManger.create({
        header: 'Warning',
        subHeader: 'Empty search field.',
        buttons: ['OK']
      });
    }
  }

  trackByUsername(index: number, username: string) {
    return username;
  }

}
