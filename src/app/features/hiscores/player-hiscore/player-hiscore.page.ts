import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRefresher, LoadingController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { finalize } from 'rxjs/operators';
import { AlertManager } from 'services/alert-manager/alert.manager';
import { Hiscore, Minigame, Skill } from 'services/hiscores/hiscore.model';
import { HiscoresService } from 'services/hiscores/hiscores.service';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Component({
  selector: 'page-player-hiscore',
  templateUrl: 'player-hiscore.page.html',
  styleUrls: ['./player-hiscore.page.scss'],
})
export class PlayerHiscorePage {
  readonly AppRoute = AppRoute;

  @ViewChild(IonRefresher, { static: true }) refresher: IonRefresher;

  hiscore: Hiscore;
  hiscoreSuffix = 'normal';
  oldHiscoreSuffix = 'normal';

  isFavorite = false;

  constructor(
    private loadCtrl: LoadingController,
    private alertManager: AlertManager,
    private hiscoreService: HiscoresService,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.hiscore = this.activatedRoute.snapshot.data.playerHiscore;
    this.hiscoreSuffix = this.oldHiscoreSuffix = this.getHiscoreSuffix();

    this.addPlayerToRecents();

    this.storageService
      .getValue<string[]>(StorageKey.FavoriteHiscores, [])
      .then(favorites => (this.isFavorite = favorites.includes(this.hiscore.player.username)));
  }

  async favorite(): Promise<void> {
    this.isFavorite = await this.storageService.uniqueCacheToggle(
      StorageKey.FavoriteHiscores,
      this.hiscore.player.username
    );
    this.addPlayerToRecents();
  }

  getTypeImageUrl(): string {
    return `./assets/imgs/player_types/${this.hiscore.player.deIroned ? 'de_' : ''}${this.hiscore.type}.png`;
  }

  refreshHiscore(): void {
    this.hiscoreService
      .getHiscore(this.hiscore.player.username, this.oldHiscoreSuffix)
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe(hiscore => (this.hiscore = hiscore));
  }

  async changeHiscore(): Promise<void> {
    if (this.oldHiscoreSuffix === this.hiscoreSuffix) {
      return;
    }

    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    await loader.present();

    this.hiscoreService
      .getHiscore(this.hiscore.player.username, this.hiscoreSuffix)
      .pipe(finalize(() => loader.dismiss()))
      .subscribe({
        next: hiscores => {
          this.hiscore = hiscores;
          this.oldHiscoreSuffix = this.hiscoreSuffix;
        },
        error: () => {
          this.hiscoreSuffix = this.oldHiscoreSuffix;
          this.alertManager.create({
            header: 'Player not found',
            buttons: ['OK'],
          });
        },
      });
  }

  trackBySkillName(index: number, skill: Skill): string {
    return skill.name;
  }

  trackByMinigameName(index: number, minigame: Minigame): string {
    return minigame.name;
  }

  private getHiscoreSuffix(): string {
    if (this.hiscore.type === 'normal' || this.hiscore.player.deIroned) {
      return 'normal';
    }
    return this.hiscore.player.dead ? 'ironman' : this.hiscore.type;
  }

  private async addPlayerToRecents(): Promise<void> {
    const favoritedPlayers = await this.storageService.getValue(StorageKey.FavoriteHiscores, []);

    await this.storageService.limitedArrayPush(StorageKey.RecentHiscores, this.hiscore.player.username, {
      maxLength: 5,
      blacklist: favoritedPlayers,
    });
  }
}
