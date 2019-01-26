import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
import { Subscription } from 'rxjs';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { SettingsProvider } from 'services/settings/settings';
import { XpTrackerView } from 'services/settings/xp-tracker-view';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { XpTrackerRoute } from '../hiscores.routes';
import { XpTrackerViewCache } from './xp-tracker-view-cache.service';

@Component({
  selector: 'page-xp-tracker-view',
  templateUrl: './xp-tracker-view.page.html',
  styleUrls: ['./xp-tracker-view.page.scss']
})
export class XpTrackerViewPage implements OnDestroy {

  readonly AppRoute = AppRoute;
  readonly XpTrackerRoute = XpTrackerRoute;

  hiscore: Hiscore;
  rootParams: { hiscore, xp };

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
    this.xpTrackerViewCache.store(this.rootParams = activatedRoute.snapshot.data.period);
    this.hiscore = activatedRoute.snapshot.data.period[1];

    ({ username: this.username, type: this.type, deIroned: this.deIroned, dead: this.dead } = this.hiscore);

    this.storageService.limitedArrayPush(StorageKey.RecentXp, this.hiscore.username, { maxLength: 5 });

    this.storageService.getValue<string[]>(StorageKey.FavoriteXp)
      .then(favorites => favorites || [])
      .then(favorites => this.isFavorite = favorites.includes(this.hiscore.username.toString()));

    this.loadPreferredRoute();
  }

  getTabRoute(tab: string) {
    return `/${AppRoute.XpTracker}/${XpTrackerRoute.View}/${this.hiscore.username}/(${tab}:${tab})`;
  }

  goToHiscore() {
    this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, this.hiscore.username]);
  }

  favorite() {
    this.storageService.uniqueCacheToggle(StorageKey.FavoriteXp, this.username)
      .then(isFavorited => this.isFavorite = isFavorited);
  }

  getTypeImageUrl() {
    return `./assets/imgs/player_types/${this.deIroned ? 'de_' : ''}${this.type}.png`;
  }

  ngOnDestroy() {
    this.xpTrackerViewCache.clear();
    this.settingsSubscription.unsubscribe();
  }

  private loadPreferredRoute() {
    this.settingsSubscription.add(this.settingsProvider.settings.subscribe(settings => {
      if (this.activatedRoute.children.length === 0) {
        if (settings.preferredXpTrackerView === XpTrackerView.AdventureLog) {
          return this.router.navigate([ AppRoute.XpTracker, XpTrackerRoute.View, this.username, XpTrackerRoute.AdventureLog]);
        } else if (settings.preferredXpTrackerView === XpTrackerView.DataTable) {
          return this.router.navigate([ AppRoute.XpTracker, XpTrackerRoute.View, this.username, XpTrackerRoute.DataTable]);
        }
      }
    }));
  }

}
