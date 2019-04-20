import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { Subscription } from 'rxjs';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { PreferredXpTrackerView } from 'services/settings/preferred-xp-tracker-view';
import { SettingsProvider } from 'services/settings/settings';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { XpTrackerRoute } from '../hiscores.routes';
import { XpTrackerViewCache } from './xp-tracker-view-cache.service';

@Component({
  selector: 'page-xp-tracker-view',
  templateUrl: './xp-tracker-view.page.html',
  styleUrls: ['./xp-tracker-view.page.scss'],
})
export class XpTrackerViewPage implements OnDestroy {
  readonly AppRoute = AppRoute;
  readonly XpTrackerRoute = XpTrackerRoute;

  hiscore: Hiscore;
  rootParams: { hiscore; xp };

  isFavorite: boolean = null;
  username: string;
  type = 'normal';
  deIroned = false;
  dead = false;

  settingsSubscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService,
    private settingsProvider: SettingsProvider,
    private xpTrackerViewCache: XpTrackerViewCache
  ) {
    this.xpTrackerViewCache.store((this.rootParams = activatedRoute.snapshot.data.period));
    this.hiscore = activatedRoute.snapshot.data.period[1];
    ({ username: this.username, type: this.type, deIroned: this.deIroned, dead: this.dead } = this.hiscore);

    this.addXpToRecents();

    this.storageService
      .getValue<string[]>(StorageKey.FavoriteXp, [])
      .then(favorites => (this.isFavorite = favorites.includes(this.hiscore.username.toString())));

    this.loadPreferredRoute();
  }

  getTabRoute(tab: string) {
    return `/${AppRoute.XpTracker}/${XpTrackerRoute.View}/${this.hiscore.username}/(${tab}:${tab})`;
  }

  async goToHiscore() {
    await this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, this.hiscore.username]);
  }

  async favorite() {
    this.isFavorite = await this.storageService.uniqueCacheToggle(StorageKey.FavoriteXp, this.username);
    await this.addXpToRecents();
  }

  getTypeImageUrl() {
    return `./assets/imgs/player_types/${this.deIroned ? 'de_' : ''}${this.type}.png`;
  }

  ngOnDestroy() {
    this.xpTrackerViewCache.clear();
    this.settingsSubscription.unsubscribe();
  }

  private loadPreferredRoute() {
    const settingsSubscribtion = this.settingsProvider.settings.subscribe(settings => {
      if (this.activatedRoute.children.length !== 0) {
        return;
      }
      if (settings.preferredXpTrackerView === PreferredXpTrackerView.AdventureLog) {
        return this.router.navigate([
          AppRoute.XpTracker,
          XpTrackerRoute.View,
          this.username,
          XpTrackerRoute.AdventureLog,
        ]);
      }
      if (settings.preferredXpTrackerView === PreferredXpTrackerView.DataTable) {
        return this.router.navigate([AppRoute.XpTracker, XpTrackerRoute.View, this.username, XpTrackerRoute.DataTable]);
      }
    });

    this.settingsSubscription.add(settingsSubscribtion);
  }

  private async addXpToRecents(): Promise<void> {
    const favoritedXp = await this.storageService.getValue(StorageKey.FavoriteXp, []);

    await this.storageService.limitedArrayPush(StorageKey.RecentXp, this.hiscore.username, {
      maxLength: 5,
      blacklist: favoritedXp,
    });
  }
}
