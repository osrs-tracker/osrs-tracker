import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { Xp, XpProvider } from 'services/xp/xp';
import { XpTrackerViewCache } from './xp-tracker-view-cache.service';

@Injectable({
  providedIn: 'root',
})
export class XpTrackerViewResolver implements Resolve<[Xp[], Hiscore]> {
  constructor(
    private alertManager: AlertManager,
    private loadCtrl: LoadingController,
    private hiscoreProvider: HiscoresProvider,
    private xpProvider: XpProvider,
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
    return this.hiscoreProvider
      .getHiscoreAndType(player)
      .pipe(
        finalize(() => loader.dismiss()),
        switchMap((hiscore: Hiscore) => forkJoin(this.xpProvider.getXpFor(player), of(hiscore))),
        tap(([xp, hiscore]) => {
          const justTracking = xp.length === 1 && xp[0].xp.skills[0].exp === hiscore.skills[0].exp;
          if (justTracking) {
            this.showJustTrackingDialog();
          }
        })
      )
      .toPromise();
  }

  private showJustTrackingDialog() {
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
