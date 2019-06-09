import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AppRoute } from 'src/app/app-routing.routes';
import { Hiscore } from 'src/app/services/hiscores/hiscore.model';
import { HiscoresService } from 'src/app/services/hiscores/hiscores.service';
import { StorageKey } from 'src/app/services/storage/storage-key';
import { StorageService } from 'src/app/services/storage/storage.service';
import { HiscoresRoute } from '../../hiscores.routes';

@Component({
  selector: 'hiscore-favorite',
  templateUrl: 'hiscore-favorite.component.html',
  styleUrls: ['hiscore-favorite.component.scss'],
})
export class HiscoreFavoriteComponent implements OnInit {
  @Input() player: string;

  @Output() notFound = new EventEmitter();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  icon: string;
  hiscore: Hiscore;
  combatLevel: number;

  loading = true;

  constructor(
    private hiscoreProvider: HiscoresService,
    private storageService: StorageService,
    private navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.getData().subscribe();
  }

  goToHiscore(): Promise<boolean> {
    return this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, this.player]);
  }

  getData(): Observable<Hiscore> {
    this.loading = true;
    return this.hiscoreProvider.getHiscoreAndType(this.player).pipe(
      finalize(() => (this.loading = false)),
      catchError(err => {
        if (err.status === 404) {
          this.notFound.emit();
        }
        return EMPTY;
      }),
      tap(hiscore => {
        this.hiscore = hiscore;
        this.combatLevel = this.calculateCombatLevel(hiscore);
        this.icon = `./assets/imgs/player_types/${this.hiscore.player.deIroned ? 'de_' : ''}${
          this.hiscore.player.playerType
        }.png`;
      })
    );
  }

  private calculateCombatLevel(hiscore: Hiscore): number {
    const [, attack, defence, strength, hitpoints, ranged, prayer, magic] = hiscore.skills.map(skill =>
      Number(skill.level)
    );

    const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const range = 0.325 * (Math.floor(ranged / 2) + ranged);
    const mage = 0.325 * (Math.floor(magic / 2) + magic);
    return Math.floor(base + Math.max(melee, range, mage));
  }

  async deleteItem(): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteHiscores, this.player);
    await this.storageService.removeFromArray(StorageKey.RecentHiscores, this.player);
    this.delete.emit();
  }
}
