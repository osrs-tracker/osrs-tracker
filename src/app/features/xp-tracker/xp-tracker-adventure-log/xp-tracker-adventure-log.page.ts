import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonRefresher } from '@ionic/angular';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { Xp, XpProvider } from 'services/xp/xp';
import { XpTrackerViewCache } from '../xp-tracker-view/xp-tracker-view-cache.service';

@Component({
  selector: 'page-xp-tracker-adventure-log',
  templateUrl: './xp-tracker-adventure-log.page.html',
  styleUrls: ['./xp-tracker-adventure-log.page.scss'],
})
export class XpTrackerAdventureLogPage {
  private readonly INFINITE_LOAD_COUNT_PERIOD = 14;
  private readonly INFINITE_LOAD_COUNT_INFINITE = 7;

  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  private originalHiscore: Hiscore;
  private originalXp: Xp[];
  private period: Xp[];
  logs: Xp[];

  username: string;
  private loading = false;

  constructor(
    private datePipe: DatePipe,
    private hiscoreProvider: HiscoresProvider,
    private xpProvider: XpProvider,
    private xpTrackerViewCache: XpTrackerViewCache
  ) {
    this.originalXp = this.xpTrackerViewCache.get()![0];
    this.originalHiscore = this.xpTrackerViewCache.get()![1];
    this.period = this.xpProvider.calcXpGains(this.originalXp, this.originalHiscore);

    this.parseLogs();

    this.username = this.originalHiscore.player.username;
  }

  doRefresh(): void {
    forkJoin(
      this.xpProvider.getXpFor(this.username, this.INFINITE_LOAD_COUNT_PERIOD),
      this.hiscoreProvider.getHiscoreAndType(this.username)
    )
      .pipe(
        finalize(() => {
          this.refresher.complete();
          this.infiniteScroll.disabled = false;
        })
      )
      .subscribe(([xp, hiscore]) => {
        this.xpTrackerViewCache.store([xp, hiscore]);
        this.originalXp = xp;
        this.period = this.xpProvider.calcXpGains(this.originalXp, hiscore);
        this.parseLogs();
      });
  }

  doInfinite(): void {
    if (!this.loading) {
      this.loading = true;
      forkJoin(
        this.xpProvider.getXpFor(this.username, this.INFINITE_LOAD_COUNT_INFINITE, this.originalXp.length),
        timer(500)
      )
        .pipe(
          finalize(() => {
            this.loading = false;
            this.infiniteScroll.complete();
          })
        )
        .subscribe(
          ([xp]) => {
            if (xp.length === 0) {
              return (this.infiniteScroll.disabled = true);
            }
            this.originalXp = [...this.originalXp, ...xp];
            this.period = this.xpProvider.calcXpGains(this.originalXp, this.originalHiscore);
            this.parseLogs();
            if (xp.length < this.INFINITE_LOAD_COUNT_INFINITE) {
              this.infiniteScroll.disabled = true;
            }
          },
          () => (this.infiniteScroll.disabled = true)
        );
    }
  }

  getFormattedDate(date: Date): string {
    const today = new Date();
    if (date.getUTCFullYear() === today.getUTCFullYear() && date.getUTCMonth() === today.getUTCMonth()) {
      if (date.getUTCDate() === today.getUTCDate()) {
        return 'Today';
      } else if (date.getUTCDate() === today.getUTCDate() - 1) {
        return 'Yesterday';
      }
    }
    return this.datePipe.transform(date, 'MMMM d, yyyy')!;
  }

  trackByXpDate(index: number, xp: Xp): number {
    return xp.date.getTime();
  }

  trackByName(index: number, prop: { name: string }): string {
    return prop.name;
  }

  private parseLogs(): void {
    this.logs = this.period.map(period => {
      period.xp.skills = [period.xp.skills[0], ...period.xp.skills.slice(1).filter(skill => Number(skill.level) > 0)];
      period.xp.cluescrolls = period.xp.cluescrolls.slice(1).filter(cluescroll => Number(cluescroll.amount) > 0);
      period.xp.bountyhunter = period.xp.bountyhunter.filter(bountyhunter => Number(bountyhunter.amount) > 0);
      return period;
    });
  }
}
