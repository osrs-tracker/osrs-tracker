import { Component, ViewChild } from '@angular/core';
import { Refresher, InfiniteScroll } from '@ionic/angular';
import { Xp, XpProvider } from 'services/xp/xp';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { DatePipe } from '@angular/common';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { XpTrackerViewCache } from '../xp-tracker-view/xp-tracker-view-cache.service';

@Component({
  selector: 'page-xp-tracker-adventure-log',
  templateUrl: './xp-tracker-adventure-log.page.html',
  styleUrls: ['./xp-tracker-adventure-log.page.scss']
})
export class XpTrackerAdventureLogPage {

  private readonly INFINITE_LOAD_COUNT_PERIOD = 14;
  private readonly INFINITE_LOAD_COUNT_INFINITE = 7;

  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

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
    this.originalXp = this.xpTrackerViewCache.get()[0];
    this.originalHiscore = this.xpTrackerViewCache.get()[1];
    this.period = this.xpProvider.calcXpGains(this.originalXp, this.originalHiscore);

    this.parseLogs();

    this.username = this.originalHiscore.username;
  }

  doRefresh(): void {
    forkJoin(
      this.xpProvider.getXpFor(this.username, this.INFINITE_LOAD_COUNT_PERIOD),
      this.hiscoreProvider.getHiscoreAndType(this.username)
    ).pipe(
      finalize(() => {
        this.refresher.complete();
        this.infiniteScroll.disabled = false;
      })
    ).subscribe(([xp, hiscore]) => {
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
      ).pipe(
        finalize(() => {
          this.loading = false;
          this.infiniteScroll.complete();
        })
      ).subscribe(([xp]) => {
          if (xp.length === 0) {
            return this.infiniteScroll.disabled = true;
          }
          this.originalXp = [...this.originalXp, ...xp];
          this.period = this.xpProvider.calcXpGains(this.originalXp, this.originalHiscore);
          this.parseLogs();
          if (xp.length < this.INFINITE_LOAD_COUNT_INFINITE) {
            this.infiniteScroll.disabled = true;
          }
        }, () => this.infiniteScroll.disabled = true);
    }
  }

  getFormattedDate(date: Date, index: number): string {
    switch (index) {
      case 0: return 'Today';
      case 1: return 'Yesterday';
      default: return this.datePipe.transform(date, 'MMMM d, yyyy');
    }
  }

  trackByXpDate(index: number, xp: Xp) {
    return xp.date.getTime();
  }

  trackByName(index: number, prop: { name: string }) {
    return prop.name;
  }

  private parseLogs() {
    this.logs = this.period.map((period) => {
      period.xp.skills = [
        period.xp.skills.shift(),
        ...period.xp.skills.filter(skill => +skill.level > 0)
      ];
      period.xp.cluescrolls = period.xp.cluescrolls.slice(1).filter(cluescroll => +cluescroll.amount > 0);
      period.xp.bountyhunter = period.xp.bountyhunter.filter(bountyhunter => +bountyhunter.amount > 0);
      return period;
    });
  }

}
