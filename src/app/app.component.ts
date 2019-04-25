import { Component, DoCheck, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { IonMenu, NavController, Platform } from '@ionic/angular';
import { AppRoute } from './app-routing.routes';
import { AlertManager } from './services/alert-manager/alert-manager';
import { NewsProvider } from './services/news/news';

class Page {
  constructor(
    public id: number,
    public src: string,
    public title: string,
    public route?: string,
    public badge?: string,
    public action?: () => void
  ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements DoCheck {
  @ViewChild(IonMenu) menu: IonMenu;

  cdCount = 0;

  pages: Page[] = [
    new Page(0, 'svg/md-home.svg', 'Home', AppRoute.Home),
    new Page(1, 'svg/md-today.svg', 'App News', AppRoute.AppNews, undefined, () => this.checkForNewAppNews()),
    new Page(2, 'svg/md-trending-up.svg', 'Grand Exchange', AppRoute.GrandExchange),
    new Page(3, 'svg/md-trophy.svg', 'Hiscores', AppRoute.Hiscores),
    new Page(4, 'svg/md-podium.svg', 'XP Tracker', AppRoute.XpTracker),
    new Page(5, 'svg/md-discord.svg', 'Discord', undefined, undefined, () =>
      window.open('https://discord.gg/k7E6WZj', '_system')
    ),
    new Page(5, 'svg/md-star.svg', 'Rate App', undefined, undefined, () =>
      window.open('market://details?id=com.toxsickproductions.geptv2', '_system')
    ),
    new Page(6, 'svg/md-settings.svg', 'Settings', AppRoute.Settings),
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

  async initializeApp(): Promise<void> {
    await this.platform.ready();
    this.splashScreen.hide();
    this.backButtonLogic();
    this.checkForNewAppNews();
    this.menu.ionWillOpen.subscribe({ next: () => this.checkForNewAppNews() });
  }

  ngDoCheck(): void {
    console.log(this.cdCount++);
  }

  linkClicked(page: Page): void {
    if (page.action) {
      page.action();
    }
    if (page.route) {
      this.navCtrl.navigateRoot(page.route, { animated: false });
    }
  }

  trackByPageId(index: number, page: Page): number {
    return page.id;
  }

  splitPaneChanged(event: any): void {
    this.splitPaneVisible = event.detail.visible;
  }

  private async checkForNewAppNews(): Promise<void> {
    if (await this.newsProvider.isNewAppArticleAvailable()) {
      this.pages.filter(page => page.title === 'App News')[0].badge = 'NEW';
    } else {
      this.pages.filter(page => page.title === 'App News')[0].badge = undefined;
    }
  }

  private backButtonLogic(): void {
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
        (navigator as any)['app'].exitApp();
      }
    });
  }
}
