import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { XpTrackerRoute } from 'features/xp-tracker/hiscores.routes';
import { forkJoin, throwError } from 'rxjs';
import { catchError, finalize, retry, tap } from 'rxjs/operators';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { XpProvider } from 'services/xp/xp';
import { StorageService } from 'services/storage/storage.service';
import { StorageKey } from 'services/storage/storage-key';

@Component({
  selector: 'xp-favorite',
  templateUrl: './xp-favorite.component.html',
  styleUrls: ['./xp-favorite.component.scss']
})
export class XpFavoriteComponent implements OnInit {

  @Input() player: string;

  @Output() notFound = new EventEmitter();
  @Output() update: EventEmitter<void> = new EventEmitter<void>();

  hiscore: Hiscore;
  gains: string;

  loading = true;

  constructor(
    private hiscoreProvider: HiscoresProvider,
    private storageService: StorageService,
    private navCtrl: NavController,
    private xpProvider: XpProvider
  ) { }

  goToXp() {
    this.navCtrl.navigateForward([AppRoute.XpTracker, XpTrackerRoute.View, this.player]);
  }

  ngOnInit() {
    this.getData().subscribe();
  }

  getData() {
    this.gains = undefined;
    this.loading = true;
    return forkJoin(
      this.xpProvider.getXpFor(this.player, 1),
      this.hiscoreProvider.getHiscoreAndType(this.player)
    ).pipe(
      finalize(() => this.loading = false),
      catchError(err => {
        if (err.status === 404) {
          this.notFound.emit();
        } return throwError(err);
      }),
      retry(2),
      tap(([xp, hiscore]) => {
        this.hiscore = hiscore;
        this.gains = this.xpProvider.calcXpGains(xp, hiscore)[0].xp.skills[0].exp;
      })
    );
  }

  get typeImageUrl() {
    return this.hiscore ?
      `./assets/imgs/player_types/${this.hiscore.deIroned ? 'de_' : ''}${this.hiscore.type}.png` : '';
  }

  async deleteItem(): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteXp, this.player);
    await this.storageService.removeFromArray(StorageKey.RecentXp, this.player);
    this.update.emit();
  }

}
