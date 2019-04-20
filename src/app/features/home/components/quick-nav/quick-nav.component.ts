import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from '../../../../app-routing.routes';

class QuickNavButton {
  constructor(public id: number, public icon: string, public title: string, public page: string) {}
}

@Component({
  selector: 'quick-nav',
  templateUrl: 'quick-nav.component.html',
  styleUrls: ['./quick-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickNavComponent {
  buttons = [
    new QuickNavButton(0, 'ios-paper', 'App News', AppRoute.AppNews),
    new QuickNavButton(1, 'trending-up', 'GE Tracker', AppRoute.GrandExchange),
    new QuickNavButton(2, 'trophy', 'Hiscores', AppRoute.Hiscores),
    new QuickNavButton(3, 'ios-podium', 'XP Tracker', AppRoute.XpTracker),
  ];

  constructor(private navCtrl: NavController) {}

  async navigateTo(page: string) {
    await this.navCtrl.navigateForward(page);
  }

  trackByButtonId(index: number, button: QuickNavButton) {
    return button.id;
  }
}
