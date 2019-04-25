import { Component, Input, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { XpTrackerRoute } from 'features/xp-tracker/hiscores.routes';
import { forkJoin, Observable, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { XpFavoriteComponent } from '../xp-favorite/xp-favorite.component';

@Component({
  selector: 'search-xp',
  templateUrl: 'search-xp.component.html',
  styleUrls: ['./search-xp.component.scss'],
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
    private storageService: StorageService
  ) {
    this.updateFavorites();
    this.updateRecent();
  }

  async updateFavorites(): Promise<void> {
    this.favoriteXp = await this.storageService.getValue<string[]>(StorageKey.FavoriteXp, []);
  }

  async updateRecent(): Promise<void> {
    this.recentXp = await this.storageService.getValue<string[]>(StorageKey.RecentXp, []);
  }

  refresh(): Observable<any> {
    return forkJoin([timer(500), ...(this.xpFavoriteComponents || []).map(fav => fav.getData())]);
  }

  async removeFavorite(username: string): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteXp, username);
    await this.updateFavorites();
  }

  async removeRecent(username: string): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.RecentXp, username);
    await this.updateFavorites();
  }

  async searchXp(playerName: string): Promise<void> {
    playerName = playerName.trim();

    if (!playerName) {
      return await this.alertManger.create({
        header: 'Warning',
        subHeader: 'Empty search field.',
        buttons: ['OK'],
      });
    }

    try {
      await this.navCtrl.navigateForward([AppRoute.XpTracker, XpTrackerRoute.View, playerName.toLocaleLowerCase()]);
    } catch (e) {
      this.alertManger.create({
        header: 'Player not found',
        buttons: ['OK'],
      });
    }
  }

  trackByUsername(index: number, username: string): string {
    return username;
  }
}
