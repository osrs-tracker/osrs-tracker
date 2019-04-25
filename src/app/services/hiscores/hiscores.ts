import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeHttp } from 'app/core/native-http/nativeHttp';
import { environment } from 'environments/environment';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { XpProvider } from '../xp/xp';
import { HiscoreUtilitiesProvider } from './hiscore-utilities';
import { Hiscore, Player } from './hiscore.model';

const CACHE_TIME_TYPES = 12; // hours

@Injectable({
  providedIn: 'root',
})
export class HiscoresProvider {
  constructor(
    private http: HttpClient,
    private nativeHttp: NativeHttp,
    private hiscoreUtilities: HiscoreUtilitiesProvider,
    private xpProvider: XpProvider
  ) {}

  getCompareHiscores(username: string, compare: string): Observable<Hiscore[]> {
    return forkJoin(
      this.getHiscore(username).pipe(catchError(err => of(err))),
      this.getHiscore(compare).pipe(catchError(err => of(err)))
    ).pipe(
      switchMap(([forUsername, forCompare]) => {
        if (forUsername.status !== 404 && forCompare.status !== 404) {
          return of([forUsername, forCompare]);
        } else {
          return throwError((forUsername.status === 404 ? 1 : 0) + (forCompare.status === 404 ? 2 : 0));
        }
      })
    );
  }

  getHiscore(username: string, type: string = ''): Observable<Hiscore> {
    type = type === 'normal' ? '' : type;
    return this.nativeHttp
      .getText(
        `${environment.API_RUNESCAPE}/m=hiscore_oldschool${type ? `_${type}` : ''}/index_lite.ws?player=${username}`
      )
      .pipe(
        map(response => ({
          ...this.hiscoreUtilities.parseHiscoreString(response, new Date()),
          player: new Player(username),
          type: type ? type : 'normal',
        }))
      );
  }

  getHiscoreAndType(username: string): Observable<Hiscore> {
    return this.http.get(`${environment.API_GEPT}/player/${username}`, { observe: 'response' }).pipe(
      catchError(err => of(err)),
      mergeMap(response => {
        if (response.status === 200) {
          const player = response.body as Player;
          const hoursSinceCheck = (Date.now() - new Date(player.lastChecked!).getTime()) / 36e5;

          // When a player is a normal player, don't try to redetermine it's type.
          if (player.playerType === 'normal') {
            const requests$: Observable<any>[] = [this.getHiscore(player.username)];
            if (hoursSinceCheck > CACHE_TIME_TYPES) {
              // Update lastChecked only when CACHE_TIME_TYPES expired
              requests$.push(this.insertOrUpdatePlayer(player));
            }
            return forkJoin(requests$).pipe(
              map(([hiscore]) => ({ ...hiscore, player })),
              catchError(err => throwError(err))
            );
          }

          // Return cached ironman status.
          if (hoursSinceCheck < CACHE_TIME_TYPES) {
            return this.getHiscore(
              username,
              player.deIroned ? 'normal' : player.dead ? 'ironman' : player.playerType
            ).pipe(
              map((hiscore: Hiscore) => ({ ...hiscore, player })),
              catchError(err => throwError(err))
            );
          }
        }
        // Determine ironman status after CACHE_TIME_TYPES have expired (dead hardcore? deironed?)
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
      switchMap(response => {
        const [normal, ironman, ultimate, hardcore] = response;
        if (normal.status === 404) {
          return throwError(normal);
        } else if (ultimate.status !== 404 && hardcore.status === 404) {
          const deIroned = +ultimate.skills[0].exp < +normal.skills[0].exp;

          const player = new Player(username.trim(), 'ultimate', deIroned);
          return forkJoin(of({ ...(deIroned ? normal : ultimate), player }), this.insertOrUpdatePlayer(player));
        } else if (hardcore.status !== 404 && ultimate.status === 404) {
          const deIroned = +ironman.skills[0].exp < +normal.skills[0].exp;
          const dead = +ironman.skills[0].exp > +hardcore.skills[0].exp;

          const player = new Player(username.trim(), 'hardcore_ironman', deIroned, dead);
          return forkJoin(
            of({ ...(deIroned ? normal : dead ? ironman : hardcore), player }),
            this.insertOrUpdatePlayer(player)
          );
        } else if (ironman.status !== 404) {
          const deIroned = +ironman.skills[0].exp < +normal.skills[0].exp;

          const player = new Player(username.trim(), 'ironman', deIroned);
          return forkJoin(of({ ...(deIroned ? normal : ironman), player }), this.insertOrUpdatePlayer(player));
        } else {
          const player = new Player(username.trim(), 'normal');
          return forkJoin(of({ ...normal, player }), this.insertOrUpdatePlayer(player));
        }
      }),
      switchMap(([hiscore, statusCode]: [Hiscore, number]) =>
        statusCode === 201 ? this.xpProvider.insertInitialXpDatapoint(username, hiscore) : of(hiscore)
      )
    );
  }

  private insertOrUpdatePlayer(player: Player): Observable<number> {
    return this.http
      .post(`${environment.API_GEPT}/player`, player, { observe: 'response' })
      .pipe(map(res => res.status));
  }
}
