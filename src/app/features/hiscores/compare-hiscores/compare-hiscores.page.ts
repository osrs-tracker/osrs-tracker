import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRefresher } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { finalize } from 'rxjs/operators';
import { Hiscore, Minigame, Skill } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';

@Component({
  selector: 'page-compare-hiscores',
  templateUrl: './compare-hiscores.page.html',
  styleUrls: ['./compare-hiscores.page.scss'],
})
export class HiscoresComparePage {
  readonly AppRoute = AppRoute;

  @ViewChild(IonRefresher) refresher: IonRefresher;

  playerHiscore: Hiscore;
  compareHiscore: Hiscore;

  expToggle = true;

  constructor(private hiscoreProvider: HiscoresProvider, private activatedRoute: ActivatedRoute) {
    [this.playerHiscore, this.compareHiscore] = this.activatedRoute.snapshot.data.compareHiscores;
  }

  refreshHiscores(): void {
    this.hiscoreProvider
      .getCompareHiscores(this.playerHiscore.player.username, this.compareHiscore.player.username)
      .pipe(finalize(() => this.refresher.complete()))
      .subscribe(([player, compare]) => {
        this.playerHiscore = player;
        this.compareHiscore = compare;
      });
  }

  getSkillImg(index: number): string {
    return `./assets/imgs/skills/${index + 1}.gif`;
  }

  compareIcon(playerLvl: string, compareLvl: string): string {
    const icon = Number(playerLvl) > Number(compareLvl) ? 'gt' : Number(playerLvl) < Number(compareLvl) ? 'lt' : 'eq';
    return `./assets/imgs/hiscore/${icon}.gif`;
  }

  trackBySkillName(index: number, skill: Skill): string {
    return skill.name;
  }

  trackByMinigameName(index: number, minigame: Minigame): string {
    return minigame.name;
  }
}
