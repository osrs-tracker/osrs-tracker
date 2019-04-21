import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root',
})
export class AlertManager {
  alertStack: HTMLIonAlertElement[] = [];

  constructor(private alertCtrl: AlertController) {}

  async create(options?: AlertOptions): Promise<void> {
    const alert = await this.alertCtrl.create({
      ...options,
    });
    this.alertStack.push(alert);
    alert.onDidDismiss().then(() => (this.alertStack = this.alertStack.filter(a => a.id !== alert.id)));
    await alert.present();
  }

  isDialogOpen(): boolean {
    return this.alertStack.length > 0;
  }

  async close(): Promise<void> {
    await this.alertStack.pop()!.dismiss();
  }

  closeAll(): void {
    while (this.alertStack.length > 0) {
      close();
    }
  }
}
