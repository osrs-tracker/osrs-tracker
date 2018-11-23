import { Component, Input, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { forkJoin, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { StorageProvider, STORAGE_KEY } from 'services/storage/storage';
import { HiscoreFavoriteComponent } from '../hiscore-favorite/hiscore-favorite.component';

@Component({
  selector: 'search-hiscore',
  templateUrl: './search-hiscore.component.html',
  styleUrls: ['./search-hiscore.component.scss']
})
export class SearchHiscoreComponent {

  @Input() favorites = true;
  @Input() recents = true;

  @ViewChildren(HiscoreFavoriteComponent) hiscoreFavoriteComponents: HiscoreFavoriteComponent[];
  favoriteHiscores: string[] = [];
  recentHiscores: string[] = [];

  compare = false;
  playerName = '';
  compareName = '';

  constructor(
    private navCtrl: NavController,
    private alertManager: AlertManager,
    private storageProvider: StorageProvider
  ) {
    this.storageProvider.getHiscores(
      favorites => this.favoriteHiscores = favorites,
      recents => this.recentHiscores = recents
    );
  }

  public updateFavorites() {
    this.storageProvider.getFavoriteHiscores(favorites => this.favoriteHiscores = favorites);
  }

  public updateRecent() {
    this.storageProvider.getRecentHiscores(recents => this.recentHiscores = recents);
  }

  public refresh() {
    return forkJoin(
      timer(500),
      ...(this.hiscoreFavoriteComponents || []).map(fav => fav.getData())
    );
  }

  removeFavorite(username: string) {
    this.storageProvider.removeFromArray(STORAGE_KEY.FAVORITE_HISCORES, username)
      .then(() => this.updateFavorites());
  }

  removeRecent(username: string) {
    this.storageProvider.removeFromArray(STORAGE_KEY.RECENT_HISCORES, username)
      .then(() => this.updateRecent());
  }

  async comparePlayers() {
    const playerName = this.playerName.trim();
    const compareName = this.compareName.trim();
    if (playerName.length > 0 && compareName.length > 0) {
      this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.CompareHiscores, playerName, compareName])
        .catch(err => this.alertManager.create({
          header: `${err} not found`,
          buttons: ['OK']
        }));
    } else {
      this.alertManager.create({
        header: 'Warning',
        subHeader: 'Empty search or compare field.',
        buttons: ['OK']
      });
    }
  }

  async searchPlayer() {
    const playerName = this.playerName.trim();
    if (playerName.length > 0) {
      this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, playerName])
        .catch(() => this.alertManager.create({
          header: 'Player not found',
          buttons: ['OK']
        }));
    } else {
      this.alertManager.create({
        header: 'Empty search field',
        buttons: ['OK']
      });
    }
  }

  trackByPlayer(index: number, player: string) {
    return player;
  }

}
