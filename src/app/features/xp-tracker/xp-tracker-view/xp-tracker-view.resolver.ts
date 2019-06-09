import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { AlertManager } from 'src/app/services/alert-manager/alert.manager';
import { Hiscore } from 'src/app/services/hiscores/hiscore.model';
import { HiscoresService } from 'src/app/services/hiscores/hiscores.service';
import { Xp, XpService } from 'src/app/services/xp/xp.service';
import { XpTrackerViewCache } from './xp-tracker-view-cache.service';

@Injectable({
  providedIn: 'root',
})
export class XpTrackerViewResolver implements Resolve<[Xp[], Hiscore]> {
  constructor(
    private alertManager: AlertManager,
    private loadCtrl: LoadingController,
    private hiscoreProvider: HiscoresService,
    private xpProvider: XpService,
    private xpTrackerViewCache: XpTrackerViewCache
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<[Xp[], Hiscore]> {
    const cachedResults = this.xpTrackerViewCache.get();
    if (cachedResults !== null) {
      return Promise.resolve(cachedResults);
    }

    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    await loader.present();

    const player = route.params.player;
    return forkJoin([this.hiscoreProvider.getHiscore(player), this.hiscoreProvider.getHiscoreAndType(player)])
      .pipe(
        map(([hiscore, typedHiscore]) => ({
          ...hiscore,
          player: typedHiscore.player,
          type: typedHiscore.player.playerType,
        })),
        finalize(() => loader.dismiss()),
        switchMap((hiscore: Hiscore) => forkJoin([this.xpProvider.getXpFor(player), of(hiscore)])),
        tap(([xp, hiscore]) => {
          const justTracking = xp.length === 1 && xp[0].xp.skills[0].exp === hiscore.skills[0].exp;
          if (justTracking) {
            this.showJustTrackingDialog();
          }
        })
      )
      .toPromise();
  }

  private showJustTrackingDialog(): void {
    this.alertManager.create({
      header: 'No XP gains found.',
      subHeader: 'We just started tracking you!',
      message: `
                It looks like this is the first day this player has been looked up.<br><br>
                Their experience will update once they log out on Runescape.
            `,
      buttons: ['OK'],
    });
  }
}
