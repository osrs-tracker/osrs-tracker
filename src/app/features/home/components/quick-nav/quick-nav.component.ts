import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from '../../../../app-routing.routes';

class QuickNavButton {
  constructor(
    public id: number,
    public icon: string,
    public title: string,
    public page?: string,
    public action?: () => void
  ) {}
}

@Component({
  selector: 'quick-nav',
  templateUrl: 'quick-nav.component.html',
  styleUrls: ['./quick-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickNavComponent {
  buttons = [
    new QuickNavButton(0, 'md-today', 'App News', AppRoute.AppNews),
    new QuickNavButton(1, 'md-trending-up', 'GE Tracker', AppRoute.GrandExchange),
    new QuickNavButton(2, 'md-trophy', 'Hiscores', AppRoute.Hiscores),
    new QuickNavButton(3, 'md-podium', 'XP Tracker', AppRoute.XpTracker),
    new QuickNavButton(3, 'md-wikipedia', 'OSRS Wiki', AppRoute.OSRSWiki),
    new QuickNavButton(3, 'md-discord', 'On Discord', undefined, () =>
      window.open('https://discord.gg/k7E6WZj', '_system')
    ),
  ];

  constructor(private navCtrl: NavController) {}

  doAction(button: QuickNavButton): void {
    if (button.page) {
      this.navCtrl.navigateForward(button.page);
    } else {
      button.action!();
    }
  }

  trackByButtonId(index: number, button: QuickNavButton): number {
    return button.id;
  }
}
