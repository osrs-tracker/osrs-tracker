import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';

@Component({
  selector: 'hiscore-favorite',
  templateUrl: 'hiscore-favorite.component.html',
  styleUrls: ['hiscore-favorite.component.scss'],
})
export class HiscoreFavoriteComponent implements OnInit {

  @Input() player: string;
  @Output() notFound = new EventEmitter();

  icon: string;
  hiscore: Hiscore;
  combatLevel: number;

  loading = true;

  constructor(
    private hiscoreProvider: HiscoresProvider,
    private navCtrl: NavController
  ) { }

  goToHiscore() {
    this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, this.player]);
  }

  ngOnInit() {
    this.getData().subscribe();
  }

  getData(): Observable<Hiscore> {
    this.loading = true;
    this.combatLevel = undefined;
    return this.hiscoreProvider.getHiscoreAndType(this.player)
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          if (err.status === 404) {
            this.notFound.emit();
          } return EMPTY;
        }),
        tap(hiscore => {
          this.hiscore = hiscore;
          this.combatLevel = this.calculateCombatLevel(
            +hiscore.skills[1].level,
            +hiscore.skills[3].level,
            +hiscore.skills[2].level,
            +hiscore.skills[4].level,
            +hiscore.skills[6].level,
            +hiscore.skills[5].level,
            +hiscore.skills[7].level,
          );
          this.icon = `./assets/imgs/player_types/${this.hiscore.deIroned ? 'de_' : ''}${this.hiscore.type}.png`;
        })
      );
  }

  private calculateCombatLevel(attack, strength, defence, hitpoints, prayer, ranged, magic) {
    const base = .25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = .325 * (attack + strength);
    const range = .325 * (Math.floor(ranged / 2) + ranged);
    const mage = .325 * (Math.floor(magic / 2) + magic);
    return Math.floor(base + Math.max(melee, range, mage));
  }

}
