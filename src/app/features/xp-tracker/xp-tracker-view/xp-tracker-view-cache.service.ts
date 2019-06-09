import { Injectable } from '@angular/core';
import { Hiscore } from 'src/app/services/hiscores/hiscore.model';
import { Xp } from 'src/app/services/xp/xp.service';

@Injectable({
  providedIn: 'root',
})
export class XpTrackerViewCache {
  private period: [Xp[], Hiscore] | null = null;

  store(period: [Xp[], Hiscore]): void {
    this.period = period;
  }

  get(): [Xp[], Hiscore] | null {
    return this.period;
  }

  clear(): void {
    this.period = null;
  }
}
