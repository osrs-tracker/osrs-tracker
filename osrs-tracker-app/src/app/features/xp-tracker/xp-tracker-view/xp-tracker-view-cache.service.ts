import { Injectable } from '@angular/core';
import { ItemSearchModel } from 'services/item/item.model';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { Xp } from 'services/xp/xp';

@Injectable({
  providedIn: 'root'
})
export class XpTrackerViewCache {

  private period: [ Xp[], Hiscore ] = null;

  store(period: [ Xp[], Hiscore ]): void {
    this.period = period;
  }

  get(): [ Xp[], Hiscore ] {
    return this.period;
  }

  clear(): void {
    this.period = null;
  }

}
