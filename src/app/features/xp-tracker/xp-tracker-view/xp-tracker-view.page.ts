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
  isFavorite = false;
  username: string;
  settingsSubscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService,
    private settingsProvider: SettingsProvider,
    private xpTrackerViewCache: XpTrackerViewCache
  ) {
    this.xpTrackerViewCache.store(activatedRoute.snapshot.data.period);
    this.hiscore = activatedRoute.snapshot.data.period[1];
    this.username = this.hiscore.player.username;

    this.addXpToRecents();

    this.storageService
      .getValue<string[]>(StorageKey.FavoriteXp, [])
      .then(favorites => (this.isFavorite = favorites.includes(this.username)));

    this.loadPreferredRoute();
  }

  getTabRoute(tab: string): string {
    return `/${AppRoute.XpTracker}/${XpTrackerRoute.View}/${this.username}/(${tab}:${tab})`;
  }

  goToHiscore(): Promise<boolean> {
    return this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, this.username]);
  }

  async favorite(): Promise<void> {
    this.isFavorite = await this.storageService.uniqueCacheToggle(StorageKey.FavoriteXp, this.username);
    await this.addXpToRecents();
  }

  getTypeImageUrl(): string {
    return `./assets/imgs/player_types/${this.hiscore.player.deIroned ? 'de_' : ''}${this.hiscore.type ||
      'normal'}.png`;
  }

  ngOnDestroy(): void {
    this.xpTrackerViewCache.clear();
    this.settingsSubscription.unsubscribe();
  }

  private loadPreferredRoute(): void {
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

    await this.storageService.limitedArrayPush(StorageKey.RecentXp, this.username, {
      maxLength: 5,
      blacklist: favoritedXp,
    });
  }
}
