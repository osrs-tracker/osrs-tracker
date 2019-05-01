import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SettingsProvider } from 'services/settings/settings';
import { Logger } from './logger/logger';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (platform: Platform, storage: Storage, settingsProvider: SettingsProvider) => async () => {
        await platform.ready();
        Logger.log('IonicPlatform ready');
        await storage.ready();
        Logger.log('IonicStorage ready');
        await settingsProvider.init();
        Logger.log('Settings loaded');
      },
      deps: [Platform, Storage, SettingsProvider],
      multi: true,
    },
  ],
})
export class AppInitializerModule {}
