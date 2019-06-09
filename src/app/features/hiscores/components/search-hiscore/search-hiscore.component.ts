import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { favoriteShrink } from 'core/animations/delete-shrink.animation';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { forkJoin, Observable, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert.manager';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { HiscoreFavoriteComponent } from '../hiscore-favorite/hiscore-favorite.component';

@Component({
  selector: 'search-hiscore',
  templateUrl: './search-hiscore.component.html',
  styleUrls: ['./search-hiscore.component.scss'],
  animations: [favoriteShrink],
})
export class SearchHiscoreComponent implements OnInit {
  @Input() cachedHiscores: { favorites: string[]; recents: string[] };

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
  ) {}

  ngOnInit(): void {
    this.favoriteHiscores = this.cachedHiscores.favorites;
    this.recentHiscores = this.cachedHiscores.recents;
  }

  refresh(): Observable<any> {
    return forkJoin([timer(500), ...(this.hiscoreFavoriteComponents || []).map(fav => fav.getData())]);
  }

  async updateFavorites(): Promise<void> {
    this.favoriteHiscores = await this.storageService.getValue<string[]>(StorageKey.FavoriteHiscores, []);
  }

  async updateRecent(): Promise<void> {
    this.recentHiscores = await this.storageService.getValue<string[]>(StorageKey.RecentHiscores, []);
  }

  async removeFavorite(username: string): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteHiscores, username);
    await this.updateFavorites();
  }

  async removeRecent(username: string): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.RecentHiscores, username);
    await this.updateRecent();
  }

  async comparePlayers(): Promise<void> {
    const playerName = this.playerName.trim();
    const compareName = this.compareName.trim();

    if (!playerName || !compareName) {
      return this.alertManager.create({
        header: 'Warning',
        subHeader: 'Empty search or compare field.',
        buttons: ['OK'],
      });
    }

    try {
      await this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.CompareHiscores, playerName, compareName]);
    } catch (err) {
      this.alertManager.create({
        header: `${err} not found`,
        buttons: ['OK'],
      });
    }
  }

  async searchPlayer(): Promise<void> {
    const playerName = this.playerName.trim();

    if (!playerName) {
      return this.alertManager.create({
        header: 'Empty search field',
        buttons: ['OK'],
      });
    }

    try {
      await this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, playerName]);
    } catch (e) {
      this.alertManager.create({
        header: 'Player not found',
        buttons: ['OK'],
      });
    }
  }

  trackByPlayer(index: number, player: string): string {
    return player;
  }
}
