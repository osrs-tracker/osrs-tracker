import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonRefresher } from '@ionic/angular';
import { forkJoin, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Hiscore, Skill } from 'services/hiscores/hiscore.model';
import { HiscoresService } from 'services/hiscores/hiscores.service';
import { Xp, XpService } from 'services/xp/xp.service';
import { XpTrackerViewCache } from '../xp-tracker-view/xp-tracker-view-cache.service';

@Component({
  selector: 'page-xp-data-table-player',
  templateUrl: './xp-tracker-data-table.page.html',
  styleUrls: ['./xp-tracker-data-table.page.scss'],
})
export class XpTrackerDataTablePage {
  private readonly INFINITE_LOAD_COUNT_PERIOD = 14;
  private readonly INFINITE_LOAD_COUNT_INFINITE = 7;

  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  private originalHiscore: Hiscore;
  private originalXp: Xp[];
  private period: Xp[];

  dataTable: Xp[] = [];

  username: string;

  private loading = false;

  constructor(
    private datePipe: DatePipe,
    private hiscoreProvider: HiscoresService,
    private xpProvider: XpService,
    private xpTrackerViewCache: XpTrackerViewCache
  ) {
    this.originalXp = this.xpTrackerViewCache.get()![0];
    this.originalHiscore = this.xpTrackerViewCache.get()![1];
    this.period = this.xpProvider.calcXpGains(this.originalXp, this.originalHiscore);

    this.parsePeriodToDatatable();

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
        this.originalHiscore = hiscore;
        this.period = this.xpProvider.calcXpGains(this.originalXp, hiscore);
        this.parsePeriodToDatatable();
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
            this.parsePeriodToDatatable();
            if (xp.length < this.INFINITE_LOAD_COUNT_INFINITE) {
              this.infiniteScroll.disabled = true;
            }
          },
          () => (this.infiniteScroll.disabled = true)
        );
    }
  }

  getFormattedDate(date: Date, index: number): string {
    switch (index) {
      case 0:
        return 'Today';
      case 1:
        return 'Yesterday';
      default:
        return this.datePipe.transform(date, 'MMMM d, yyyy')!;
    }
  }

  trackByXpDate(index: number, xp: Xp): number {
    return xp.date.getTime();
  }

  trackBySkillName(index: number, skill: Skill): string {
    return skill.name;
  }

  private parsePeriodToDatatable(): void {
    this.dataTable = this.period.map(period => {
      period.xp.skills = period.xp.skills.filter(skill => +skill.exp > 0);
      return period;
    });
  }
}
