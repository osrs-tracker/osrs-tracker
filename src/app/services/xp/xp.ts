import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { HiscoreUtilitiesProvider } from '../hiscores/hiscore-utilities';
import { Hiscore, Minigame, Skill } from '../hiscores/hiscore.model';

export class Xp {
  constructor(
    public date: Date,
    public xp: Hiscore
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class XpProvider {

  constructor(
    private http: HttpClient,
    private hiscoreUtilities: HiscoreUtilitiesProvider,
  ) { }

  insertInitialXpDatapoint(username: string, hiscore: Hiscore) {
    return this.http.post(`${environment.API_GEPT}/xp/${username}/initialDatapoint`, { xpString: hiscore.srcString })
      .pipe(map(() => hiscore));
  }

  getXpFor(username: string, period: number = 14, offset = 0) {
    return this.http.get(`${environment.API_GEPT}/xp/${username}/${period}`, { params: { offset: offset.toString() } })
      .pipe(map((xpPeriod: { date: string, xpString: string }[]) =>
        xpPeriod.map(xp => new Xp(new Date(xp.date), this.hiscoreUtilities.parseHiscoreString(xp.xpString, new Date(xp.date))))
      ));
  }

  calcXpGains(xpPeriod: Xp[], today: Hiscore): Xp[] {
    let previousValue = new Xp(new Date(), today);
    return xpPeriod.map(value => {
      const diff = new Xp(previousValue.date, this.hiscoreDiff(previousValue.xp, value.xp));
      previousValue = value;
      return diff;
    });
  }

  private hiscoreDiff(latest: Hiscore, oldest: Hiscore): Hiscore {
    const diffSkills: Skill[] = [];
    for (let i = 0; i < latest.skills.length; i++) {
      diffSkills.push({
        name: latest.skills[i].name,
        rank: `${+latest.skills[i].rank - +oldest.skills[i].rank}`,
        level: `${+latest.skills[i].level - +oldest.skills[i].level}`,
        exp: this.expDiff(latest.skills[i].exp, oldest.skills[i].exp)
      });
    }
    const diffClues: Minigame[] = [];
    for (let i = 0; i < latest.cluescrolls.length; i++) {
      diffClues.push({
        name: latest.cluescrolls[i].name,
        rank: `${+latest.cluescrolls[i].rank - +oldest.cluescrolls[i].rank}`,
        amount: `${Math.max(0, +latest.cluescrolls[i].amount) - Math.max(0, +oldest.cluescrolls[i].amount)}`
      });
    }
    const diffBounties: Minigame[] = [];
    for (let i = 0; i < latest.bountyhunter.length; i++) {
      diffBounties.push({
        name: latest.bountyhunter[i].name,
        rank: `${+latest.bountyhunter[i].rank - +oldest.bountyhunter[i].rank}`,
        amount: `${Math.max(0, +latest.bountyhunter[i].amount) - Math.max(0, +oldest.bountyhunter[i].amount)}`
      });
    }
    return Object.assign({}, <Hiscore>{
      skills: diffSkills,
      bountyhunter: diffBounties,
      cluescrolls: diffClues
    });
  }

  private expDiff(a: string | number, b: string | number): string {
    // For some reason for free to play people membership skills can have 0 or -1 exp in the hiscore API.
    // Default to zero to fix ghost exp in membership skills (+1 exp).
    a = (a = Number(a)) < 0 ? 0 : a;
    b = (b = Number(b)) < 0 ? 0 : b;

    return `${a - b}`;
  }

}
