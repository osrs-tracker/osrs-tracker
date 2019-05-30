import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SettingsService } from 'services/settings/settings.service';
import { Logger } from './logger/logger';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (platform: Platform, settingsProvider: SettingsService) => async () => {
        await platform.ready();
        Logger.log('IonicPlatform ready');
        await settingsProvider.init();
        Logger.log('Settings loaded');
      },
      deps: [Platform, SettingsService],
      multi: true,
    },
  ],
})
export class AppInitializerModule {}
