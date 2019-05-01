import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { HiscoresProvider } from 'services/hiscores/hiscores';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

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
    private hiscoreProvider: HiscoresProvider,
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
        this.icon = `./assets/imgs/player_types/${this.hiscore.player.deIroned ? 'de_' : ''}${this.hiscore.type}.png`;
      })
    );
  }

  private calculateCombatLevel(hiscore: Hiscore): number {
    const [, attack, strength, defence, hitpoints, prayer, ranged, magic] = hiscore.skills.map(skill =>
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
