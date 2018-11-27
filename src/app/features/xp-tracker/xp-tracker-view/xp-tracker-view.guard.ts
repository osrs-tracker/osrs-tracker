import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Settings, SettingsProvider } from 'services/settings/settings';
import { AppRoute } from 'app-routing.routes';
import { XpTrackerView } from 'services/settings/xp-tracker-view';
import { XpTrackerRoute } from '../hiscores.routes';

@Injectable({
  providedIn: 'root'
})
export class XpTrackerViewGuard implements CanActivate, OnDestroy {

  settingsSubscription = new Subscription();
  settings: Settings;

  constructor(
    private settingsProvider: SettingsProvider,
    private router: Router
  ) {
    this.settingsSubscription.add(
      this.settingsProvider.settings.subscribe(settings => this.settings = settings)
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (route.children.length !== 0) {
      return true;
    }
    if (this.settings.preferredXpTrackerView === XpTrackerView.AdventureLog) {
      this.router.navigate([decodeURI(state.url), { outlets: { [XpTrackerRoute.AdventureLog]: XpTrackerRoute.AdventureLog } }]);
    } else if (this.settings.preferredXpTrackerView === XpTrackerView.DataTable) {
      this.router.navigate([decodeURI(state.url), { outlets: { [XpTrackerRoute.DataTable]: XpTrackerRoute.DataTable } }]);
    } else {
      this.router.navigate([AppRoute.XpTracker]);
    }
    return false;
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

}
