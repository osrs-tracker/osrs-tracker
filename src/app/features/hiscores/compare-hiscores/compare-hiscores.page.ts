import { Component, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { Hiscore, Skill, Minigame } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AppRoute } from 'app-routing.routes';

@Component({
  selector: 'page-compare-hiscores',
  templateUrl: './compare-hiscores.page.html',
  styleUrls: ['./compare-hiscores.page.scss'],
})
export class HiscoresComparePage {

  readonly AppRoute = AppRoute;

  @ViewChild(IonRefresher) refresher: IonRefresher;

  player: Hiscore;
  compare: Hiscore;

  expToggle = true;

  constructor(
    private hiscoreProvider: HiscoresProvider,
    private activatedRoute: ActivatedRoute
  ) {
    ([this.player, this.compare] = this.activatedRoute.snapshot.data.compareHiscores);
  }

  refreshHiscores() {
    this.hiscoreProvider.getCompareHiscores(this.player.username, this.compare.username)
      .pipe(
        finalize(() => this.refresher.complete())
      ).subscribe(([player, compare]) => {
        this.player = player;
        this.compare = compare;
      });
  }

  getSkillImg(index: number) {
    return `./assets/imgs/skills/${index + 1}.gif`;
  }

  compareIcon(playerLvl, compareLvl) {
    const icon = +playerLvl > +compareLvl ? 'gt' : +playerLvl < +compareLvl ? 'lt' : 'eq';
    return `./assets/imgs/hiscore/${icon}.gif`;
  }

  trackBySkillName(index: number, skill: Skill) {
    return skill.name;
  }

  trackByMinigameName(index: number, minigame: Minigame) {
    return minigame.name;
  }

}
