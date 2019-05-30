import { NgModule } from '@angular/core';
import { NativeHttpModule } from 'core/native-http/nativeHttp.module';
import { AppInitializerModule } from './app-initializer.module';

@NgModule({
  imports: [AppInitializerModule, NativeHttpModule],
})
export class CoreModule {}
