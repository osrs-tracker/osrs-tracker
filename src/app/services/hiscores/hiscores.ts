import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { XpProvider } from '../xp/xp';
import { HiscoreUtilitiesProvider } from './hiscore-utilities';
import { NativeHttp } from 'app/core/native-http/nativeHttp';
import { Hiscore } from './hiscore.model';

const CACHE_TIME_TYPES = 12; // hours

export class Player {
  constructor(
    public username: string,
    public playerType: string,
    public deIroned: boolean = false,
    public dead: boolean = false,
    public lastChecked: string = null
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class HiscoresProvider {

  constructor(
    private http: HttpClient,
    private nativeHttp: NativeHttp,
    private hiscoreUtilities: HiscoreUtilitiesProvider,
    private xpProvider: XpProvider
  ) { }

  getCompareHiscores(username: string, compare: string) {
    return forkJoin(
      this.getHiscore(username).pipe(catchError(err => of(err))),
      this.getHiscore(compare).pipe(catchError(err => of(err)))
    ).pipe(mergeMap(response => {
      const [forUsername, forCompare] = response;
      if (forUsername.status !== 404 && forCompare.status !== 404) {
        return of([forUsername, forCompare]);
      } else {
        return throwError((forUsername.status === 404 ? 1 : 0) + (forCompare.status === 404 ? 2 : 0));
      }
    }));
  }

  getHiscore(username: string, type: string = ''): Observable<Hiscore> {
    type = type === 'normal' ? '' : type;
    return this.nativeHttp
      .getText(`${environment.API_RUNESCAPE}/m=hiscore_oldschool${type ? `_${type}` : ''}/index_lite.ws?player=${username}`)
      .pipe(map((response: string) => {
        const hiscore = this.hiscoreUtilities.parseHiscoreString(response, new Date());
        hiscore.username = username;
        hiscore.type = type ? type : 'normal';
        return hiscore;
      }));
  }

  getHiscoreAndType(username: string): Observable<Hiscore> {
    return this.http.get(`${environment.API_GEPT}/player/${username}`, { observe: 'response' }).pipe(
      catchError(err => of(err)),
      mergeMap(response => {
        if (response.status === 200) {
          const player = response.body;
          const hoursSinceCheck = (Date.now() - new Date(player.lastChecked).getTime()) / 36e5;

          if (hoursSinceCheck < CACHE_TIME_TYPES) {
            return this.getHiscore(username, player.deIroned ? 'normal' : player.dead ? 'ironman' : player.playerType).pipe(
              map((hiscore: Hiscore) => this.addPlayerToHiscore(hiscore, player)),
              catchError(err => throwError(err))
            );
          }
        }
        return this.determineHiscoreAndType(username);
      })
    );
  }

  private determineHiscoreAndType(username: string): Observable<Hiscore> {
    return forkJoin(
      this.getHiscore(username).pipe(catchError(err => of(err))),
      this.getHiscore(username, 'ironman').pipe(catchError(err => of(err))),
      this.getHiscore(username, 'ultimate').pipe(catchError(err => of(err))),
      this.getHiscore(username, 'hardcore_ironman').pipe(catchError(err => of(err)))
    ).pipe(
      mergeMap(response => {
        const [normal, ironman, ultimate, hardcore] = response;
        if (normal.status === 404) {
          return throwError(normal);
        } else if (ultimate.status !== 404 && hardcore.status === 404) {
          const deIroned = +ultimate.skills[0].exp < +normal.skills[0].exp;

          const player = new Player(username.trim(), 'ultimate', deIroned);
          return forkJoin(
            of(this.addPlayerToHiscore(deIroned ? normal : ultimate, player)),
            this.insertOrUpdatePlayer(player),
          );
        } else if (hardcore.status !== 404 && ultimate.status === 404) {
          const deIroned = +ironman.skills[0].exp < +normal.skills[0].exp;
          const dead = +ironman.skills[0].exp > +hardcore.skills[0].exp;

          const player = new Player(username.trim(), 'hardcore_ironman', deIroned, dead);
          return forkJoin(
            of(this.addPlayerToHiscore(deIroned ? normal : dead ? ironman : hardcore, player)),
            this.insertOrUpdatePlayer(player),
          );
        } else if (ironman.status !== 404) {
          const deIroned = +ironman.skills[0].exp < +normal.skills[0].exp;

          const player = new Player(username.trim(), 'ironman', deIroned);
          return forkJoin(
            of(this.addPlayerToHiscore(deIroned ? normal : ironman, player)),
            this.insertOrUpdatePlayer(player),
          );
        } else {
          const player = new Player(username.trim(), 'normal');
          return forkJoin(
            of(this.addPlayerToHiscore(normal, player)),
            this.insertOrUpdatePlayer(player),
          );
        }
      }),
      mergeMap(([hiscore, statusCode]: [Hiscore, number]) => statusCode === 201 ?
        this.xpProvider.insertInitialXpDatapoint(username, hiscore) : of(hiscore)
      )
    );
  }

  private addPlayerToHiscore(hiscore: Hiscore, player: Player) {
    hiscore.type = player.playerType;
    hiscore.deIroned = player.deIroned;
    hiscore.dead = player.dead;
    return hiscore;
  }

  private insertOrUpdatePlayer(player: Player): Observable<number> {
    return this.http.post(`${environment.API_GEPT}/player`, player, { observe: 'response' })
      .pipe(map(res => res.status));
  }

}
