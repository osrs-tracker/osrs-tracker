import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SettingsProvider } from 'services/settings/settings';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (settingsProvider: SettingsProvider) => () => settingsProvider.init(),
      multi: true,
      deps: [SettingsProvider]
    }
  ]
})
export class AppInitializerModule { }
