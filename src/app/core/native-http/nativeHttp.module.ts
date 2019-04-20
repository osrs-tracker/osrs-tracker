import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform } from '@ionic/angular';
import { BrowserHttpImplementation } from './browserHttpImplementation';
import { NativeHttp } from './nativeHttp';
import { NativeHttpImplementation } from './nativeHttpImplementation';

export const NativeHttpFactory = (platform: Platform, http: HTTP, httpClient: HttpClient) =>
  platform.is('cordova') ? new NativeHttpImplementation(http) : new BrowserHttpImplementation(httpClient);

/**
 * NativeHttp is so we can ignore CORS on devices, otherwise we can't use runescape API's.
 */
@NgModule({
  providers: [
    HTTP,
    {
      provide: NativeHttp,
      useFactory: NativeHttpFactory,
      deps: [Platform, HTTP, HttpClient],
    },
  ],
})
export class NativeHttpModule {}
