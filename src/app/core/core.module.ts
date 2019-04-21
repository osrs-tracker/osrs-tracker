import { NgModule } from '@angular/core';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { Device } from '@ionic-native/device/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NativeHttpModule } from 'core/native-http/nativeHttp.module';
import { AppInitializerModule } from './app-initializer.module';

@NgModule({
  imports: [AppInitializerModule, NativeHttpModule],
  providers: [
    // CORDOVA PLUGINS
    BrowserTab,
    Device,
    InAppBrowser,
    StatusBar,
    SplashScreen,
  ],
})
export class CoreModule {}
