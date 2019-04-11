import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { IonMenu, IonSplitPane, NavController, Platform } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { AppRoute } from './app-routing.routes';
import { AlertManager } from './services/alert-manager/alert-manager';
import { NewsProvider } from './services/news/news';

class Page {
  constructor(
    public id: number,
    public icon: string,
    public title: string,
    public badge: string,
    public route?: string,
    public action?: () => void
  ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements AfterViewInit {
  @ViewChild(IonMenu) menu: IonMenu;
  @ViewChild(IonSplitPane) splitPane: IonSplitPane;

  pages: Page[] = [
    new Page(0, 'home', 'Home', null, AppRoute.Home),
    new Page(1, 'ios-paper', 'App News', null, AppRoute.AppNews),
    new Page(2, 'trending-up', 'Grand Exchange', null, AppRoute.GrandExchange),
    new Page(3, 'trophy', 'Hiscores', null, AppRoute.Hiscores),
    new Page(4, 'ios-podium', 'XP Tracker', null, AppRoute.XpTracker),
    new Page(5, 'discord', 'Discord', null, null, () => window.open('https://discord.gg/k7E6WZj', '_system')),
    new Page(5, 'star', 'Rate App', null, null, () =>
      window.open('market://details?id=com.toxsickproductions.geptv2', '_system')
    ),
    new Page(6, 'settings', 'Settings', null, AppRoute.Settings),
  ];

  splitPaneVisible = false;

  constructor(
    private alertManager: AlertManager,
    private navCtrl: NavController,
    private newsProvider: NewsProvider,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.checkForNewAppNews();
    this.platform.ready().then(() => {
      this.splashScreen.hide();
      this.backButtonLogic();
    });
  }

  ngAfterViewInit() {
    this.menu.ionWillOpen.pipe(tap(() => this.checkForNewAppNews())).subscribe();
  }

  linkClicked(page: Page) {
    if (page.route) {
      this.navCtrl.navigateRoot(page.route, { animated: false });
    } else if (page.action) {
      page.action();
    }
  }

  trackByPageId(index: number, page: Page) {
    return page.id;
  }

  splitPaneChanged(event: any) {
    this.splitPaneVisible = event.detail.visible;
  }

  private checkForNewAppNews() {
    this.newsProvider
      .isNewAppArticleAvailable()
      .then(
        newAppNewsAvailable =>
          (this.pages.filter(page => page.title === 'App News')[0].badge = newAppNewsAvailable ? 'NEW' : null)
      );
  }

  private backButtonLogic() {
    this.platform.backButton.subscribeWithPriority(1, async () => {
      const segments = this.router.url.substr(1).split('/');
      if (this.alertManager.isDialogOpen()) {
        this.alertManager.close();
      } else if (!this.splitPaneVisible && (await this.menu.isOpen())) {
        this.menu.close();
      } else if (segments.includes(AppRoute.XpTracker) && segments.length > 1) {
        this.navCtrl.navigateBack(AppRoute.XpTracker);
      } else if (segments.length > 1) {
        this.navCtrl.back({ animated: true });
      } else if (!this.router.isActive(AppRoute.Home, false)) {
        this.navCtrl.navigateRoot(AppRoute.Home, { animated: true, animationDirection: 'back' });
      } else {
        navigator['app'].exitApp();
      }
    });
  }
}
