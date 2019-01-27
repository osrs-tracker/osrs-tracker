import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, IonRefresher } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { finalize } from 'rxjs/operators';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { Hiscore, Minigame, Skill } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { StorageService } from 'services/storage/storage.service';
import { StorageKey } from 'services/storage/storage-key';

@Component({
  selector: 'page-player-hiscore',
  templateUrl: 'player-hiscore.page.html',
  styleUrls: ['./player-hiscore.page.scss']
})
export class PlayerHiscorePage {

  readonly AppRoute = AppRoute;

  @ViewChild(IonRefresher) refresher: IonRefresher;

  type = 'normal';
  deIroned = false;
  dead = false;

  hiscore: Hiscore;
  hiscoreSuffix = 'normal';
  oldHiscoreSuffix = 'normal';

  isFavorite: boolean = null;

  constructor(
    private loadCtrl: LoadingController,
    private alertManager: AlertManager,
    private hiscoreService: HiscoresProvider,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.hiscore = this.activatedRoute.snapshot.data.playerHiscore;
    this.hiscoreSuffix = this.oldHiscoreSuffix = this.getHiscoreSuffix();
    ({ type: this.type, deIroned: this.deIroned, dead: this.dead } = this.hiscore);

    this.storageService.getValue<string[]>(StorageKey.FavoriteHiscores, [])
      .then(favorites => this.isFavorite = favorites.includes(this.hiscore.username));

    this.storageService.limitedArrayPush(StorageKey.RecentHiscores, this.hiscore.username, { maxLength: 5 });
  }

  favorite() {
    this.storageService.uniqueCacheToggle(StorageKey.FavoriteHiscores, this.hiscore.username)
      .then(isFavorited => this.isFavorite = isFavorited);
  }

  getTypeImageUrl() {
    return `./assets/imgs/player_types/${this.deIroned ? 'de_' : ''}${this.type}.png`;
  }

  refreshHiscore() {
    this.hiscoreService.getHiscore(this.hiscore.username, this.oldHiscoreSuffix).pipe(
      finalize(() => this.refresher.complete())
    ).subscribe(hiscores => this.hiscore = hiscores);
  }

  async changeHiscore() {
    if (this.oldHiscoreSuffix === this.hiscoreSuffix) {
      return;
    }
    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    loader.present();
    this.hiscoreService.getHiscore(this.hiscore.username, this.hiscoreSuffix).pipe(
      finalize(() => loader.dismiss())
    ).subscribe(hiscores => {
      this.hiscore = hiscores;
      this.oldHiscoreSuffix = this.hiscoreSuffix;
    }, (err) => {
      this.hiscoreSuffix = this.oldHiscoreSuffix;
      this.alertManager.create({
        header: 'Player not found',
        buttons: ['OK'],
      });
    });
  }

  trackBySkillName(index: number, skill: Skill) {
    return skill.name;
  }

  trackByMinigameName(index: number, minigame: Minigame) {
    return minigame.name;
  }

  private getHiscoreSuffix() {
    if (this.hiscore.type === 'normal' || this.hiscore.deIroned) {
      return 'normal';
    }
    return this.hiscore.dead ? 'ironman' : this.hiscore.type;
  }

}
