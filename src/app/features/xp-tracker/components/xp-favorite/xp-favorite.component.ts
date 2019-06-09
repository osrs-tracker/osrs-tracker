import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, delay, finalize, retry, tap } from 'rxjs/operators';
import { AppRoute } from 'src/app/app-routing.routes';
import { Hiscore } from 'src/app/services/hiscores/hiscore.model';
import { HiscoresService } from 'src/app/services/hiscores/hiscores.service';
import { StorageKey } from 'src/app/services/storage/storage-key';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Xp, XpService } from 'src/app/services/xp/xp.service';
import { XpTrackerRoute } from '../../xp-tracker.routes';

@Component({
  selector: 'xp-favorite',
  templateUrl: './xp-favorite.component.html',
  styleUrls: ['./xp-favorite.component.scss'],
})
export class XpFavoriteComponent implements OnInit {
  @Input() player: string;

  @Output() notFound = new EventEmitter();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  hiscore: Hiscore;
  gains?: string;

  loading = true;

  constructor(
    private hiscoreProvider: HiscoresService,
    private storageService: StorageService,
    private navCtrl: NavController,
    private xpProvider: XpService
  ) {}

  ngOnInit(): void {
    this.getData().subscribe();
  }

  goToXp(): Promise<boolean> {
    return this.navCtrl.navigateForward([AppRoute.XpTracker, XpTrackerRoute.View, this.player]);
  }

  getData(): Observable<[Xp[], Hiscore, Hiscore]> {
    this.loading = true;
    return forkJoin([
      this.xpProvider.getXpFor(this.player, 1),
      this.hiscoreProvider.getHiscore(this.player),
      this.hiscoreProvider.getHiscoreAndType(this.player),
    ]).pipe(
      finalize(() => (this.loading = false)),
      catchError(err => {
        if (err.status === 404) {
          this.notFound.emit();
        }
        return throwError(err);
      }),
      tap(([xp, hiscore, typedHiscore]) => {
        this.hiscore = {
          ...hiscore,
          player: typedHiscore.player,
        };
        this.gains = this.xpProvider.calcXpGains(xp, hiscore)[0].xp.skills[0].exp;
      }),
      delay(300),
      retry(2)
    );
  }

  get typeImageUrl(): string {
    return this.hiscore
      ? `./assets/imgs/player_types/${this.hiscore.player.deIroned ? 'de_' : ''}${this.hiscore.player.playerType}.png`
      : '';
  }

  async deleteItem(): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteXp, this.player);
    await this.storageService.removeFromArray(StorageKey.RecentXp, this.player);
    this.delete.emit();
  }
}
