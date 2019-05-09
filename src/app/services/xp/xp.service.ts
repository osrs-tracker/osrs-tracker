import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HiscoreUtilitiesService } from '../hiscores/hiscore-utilities.service';
import { Hiscore, Minigame, Skill } from '../hiscores/hiscore.model';

export class Xp {
  constructor(public date: Date, public xp: Hiscore) {}
}

@Injectable({
  providedIn: 'root',
})
export class XpService {
  constructor(private httpClient: HttpClient, private hiscoreUtilitiesService: HiscoreUtilitiesService) {}

  insertInitialXpDatapoint(username: string, hiscore: Hiscore): Observable<Hiscore> {
    return this.httpClient
      .post(`${environment.API_GEPT}/xp/${username}/initialDatapoint`, { xpString: hiscore.srcString })
      .pipe(map(() => hiscore));
  }

  getXpFor(username: string, period: number = 14, offset: number = 0): Observable<Xp[]> {
    return this.httpClient
      .get<{ date: string; xpString: string }[]>(`${environment.API_GEPT}/xp/${username}/${period}`, {
        params: { offset: offset.toString() },
      })
      .pipe(
        map(xpPeriod =>
          xpPeriod.map(
            xp =>
              new Xp(new Date(xp.date), this.hiscoreUtilitiesService.parseHiscoreString(xp.xpString, new Date(xp.date)))
          )
        )
      );
  }

  calcXpGains(xpPeriod: Xp[], today: Hiscore): Xp[] {
    let previousValue = new Xp(new Date(), today);
    return xpPeriod.map(value => {
      const diff = new Xp(value.date, this.hiscoreDiff(previousValue.xp, value.xp));
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
        exp: this.expDiff(latest.skills[i].exp, oldest.skills[i].exp),
      });
    }
    const diffClues: Minigame[] = [];
    for (const clue of latest.cluescrolls) {
      const oldClue = oldest.cluescrolls.filter(old => clue.name === old.name)[0] || { rank: 0, amount: 0 };
      diffClues.push({
        name: clue.name,
        rank: `${+clue.rank - +oldClue.rank}`,
        amount: `${Math.max(0, +clue.amount) - Math.max(0, +oldClue.amount)}`,
      });
    }

    const diffBounties: Minigame[] = [];
    for (let i = 0; i < latest.bountyhunter.length; i++) {
      diffBounties.push({
        name: latest.bountyhunter[i].name,
        rank: `${+latest.bountyhunter[i].rank - +oldest.bountyhunter[i].rank}`,
        amount: `${Math.max(0, +latest.bountyhunter[i].amount) - Math.max(0, +oldest.bountyhunter[i].amount)}`,
      });
    }

    return {
      skills: diffSkills,
      bountyhunter: diffBounties,
      cluescrolls: diffClues,
    } as Hiscore;
  }

  private expDiff(a: string | number, b: string | number): string {
    // For some reason for free to play people membership skills can have 0 or -1 exp in the hiscore API.
    // Default to zero to fix ghost exp in membership skills (+1 exp).
    return `${Math.max(Number(a), 0) - Math.max(Number(b), 0)}`;
  }
}
