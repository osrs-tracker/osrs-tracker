import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { XpTrackerRoute } from 'features/xp-tracker/hiscores.routes';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, delay, finalize, retry, tap } from 'rxjs/operators';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { Xp, XpProvider } from 'services/xp/xp';

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
    private hiscoreProvider: HiscoresProvider,
    private storageService: StorageService,
    private navCtrl: NavController,
    private xpProvider: XpProvider
  ) {}

  ngOnInit(): void {
    this.getData().subscribe();
  }

  goToXp(): Promise<boolean> {
    return this.navCtrl.navigateForward([AppRoute.XpTracker, XpTrackerRoute.View, this.player]);
  }

  getData(): Observable<[Xp[], Hiscore, Hiscore]> {
    this.loading = true;
    return forkJoin(
      this.xpProvider.getXpFor(this.player, 1),
      this.hiscoreProvider.getHiscore(this.player),
      this.hiscoreProvider.getHiscoreAndType(this.player)
    ).pipe(
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
          type: typedHiscore.type,
        };
        this.gains = this.xpProvider.calcXpGains(xp, hiscore)[0].xp.skills[0].exp;
      }),
      delay(300),
      retry(2)
    );
  }

  get typeImageUrl(): string {
    return this.hiscore
      ? `./assets/imgs/player_types/${this.hiscore.player.deIroned ? 'de_' : ''}${this.hiscore.type}.png`
      : '';
  }

  async deleteItem(): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteXp, this.player);
    await this.storageService.removeFromArray(StorageKey.RecentXp, this.player);
    this.delete.emit();
  }
}
