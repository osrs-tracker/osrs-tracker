import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { XpTrackerView } from 'services/settings/xp-tracker-view';
import { NavController } from '@ionic/angular';
import { StorageProvider } from 'services/storage/storage';
import { SettingsProvider } from 'services/settings/settings';
import { Hiscore } from 'services/hiscores/hiscore.model';
import { AppRoute } from 'app-routing.routes';
import { Router, ActivatedRoute } from '@angular/router';
import { XpTrackerRoute } from '../hiscores.routes';
import { HiscoresRoute } from 'features/hiscores/hiscores.routes';
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

  selectedTabIndex = 0;
  tabsOrder = {
    [XpTrackerView.AdventureLog]: 0,
    [XpTrackerView.DataTable]: 1,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private storageProvider: StorageProvider,
    private settingsProvider: SettingsProvider,
    private xpTrackerViewCache: XpTrackerViewCache
  ) {
    this.xpTrackerViewCache.store(this.rootParams = this.activatedRoute.snapshot.data.period);
    this.hiscore = this.activatedRoute.snapshot.data.period[1];

    ({ username: this.username, type: this.type, deIroned: this.deIroned, dead: this.dead } = this.hiscore);

    this.storageProvider.getFavoriteXp(
      favorites => this.isFavorite = (favorites || []).includes(this.hiscore.username)
    );
    this.storageProvider.addToRecentXp(this.hiscore.username);

    this.settingsSubscription.add(this.settingsProvider.settings.subscribe(settings =>
      this.selectedTabIndex = this.tabsOrder[settings.preferredXpTrackerView]
    ));
  }

  getTabRoute(tab: string) {
    return `/${AppRoute.XpTracker}/${XpTrackerRoute.View}/${this.hiscore.username}/(${tab}:${tab})`;
  }

  goToHiscore() {
    this.navCtrl.navigateForward([AppRoute.Hiscores, HiscoresRoute.PlayerHiscore, this.hiscore.username]);
  }

  favorite() {
    this.storageProvider.addToFavoriteXp(this.username, isFavorite => this.isFavorite = isFavorite);
  }

  getTypeImageUrl() {
    return `./assets/imgs/player_types/${this.deIroned ? 'de_' : ''}${this.type}.png`;
  }

  ngOnDestroy() {
    this.xpTrackerViewCache.clear();
    this.settingsSubscription.unsubscribe();
  }

}
