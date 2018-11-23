import { Component, Input, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { XpTrackerRoute } from 'features/xp-tracker/hiscores.routes';
import { forkJoin, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { StorageProvider, STORAGE_KEY } from 'services/storage/storage';
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
    private storageProvider: StorageProvider,
  ) {
    this.storageProvider.getXp(
      favorites => this.favoriteXp = favorites,
      recents => this.recentXp = recents
    );
  }

  public updateFavorites() {
    this.storageProvider.getFavoriteXp(favorites => this.favoriteXp = favorites);
  }

  public updateRecent() {
    this.storageProvider.getRecentXp(recents => this.recentXp = recents);
  }

  public refresh() {
    return forkJoin(
      timer(500),
      ...(this.xpFavoriteComponents || []).map(fav => fav.getData())
    );
  }

  removeFavorite(username: string) {
    this.storageProvider.removeFromArray(STORAGE_KEY.FAVORITE_XP, username)
      .then(() => this.updateFavorites());
  }

  removeRecent(username: string) {
    this.storageProvider.removeFromArray(STORAGE_KEY.RECENT_XP, username)
      .then(() => this.updateRecent());
  }

  async searchXp(playerName: string) {
    playerName = playerName.trim();
    if (playerName.length > 0) {
      this.navCtrl.navigateForward([AppRoute.XpTracker, XpTrackerRoute.View, playerName])
        .catch(err => this.alertManger.create({
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
