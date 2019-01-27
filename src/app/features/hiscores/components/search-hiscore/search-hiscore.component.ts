import { Component, Input, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { forkJoin, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { HiscoreFavoriteComponent } from '../hiscore-favorite/hiscore-favorite.component';
import { StorageService } from 'services/storage/storage.service';
import { StorageKey } from 'services/storage/storage-key';

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
    private storageService: StorageService
  ) {
    this.updateFavorites();
    this.updateRecent();
  }

  refresh() {
    return forkJoin([timer(500), ...(this.hiscoreFavoriteComponents || []).map(fav => fav.getData())]);
  }

  updateFavorites() {
    this.storageService.getValue<string[]>(StorageKey.FavoriteHiscores)
      .then(favorites => this.favoriteHiscores = favorites);
  }

  updateRecent() {
    this.storageService.getValue<string[]>(StorageKey.RecentHiscores)
      .then(recents => this.recentHiscores = recents);
  }

  removeFavorite(username: string) {
    this.storageService.removeFromArray(StorageKey.FavoriteHiscores, username)
      .then(() => this.updateFavorites());
  }

  removeRecent(username: string) {
    this.storageService.removeFromArray(StorageKey.RecentHiscores, username)
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
