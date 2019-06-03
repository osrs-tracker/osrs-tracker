import { NgModule } from '@angular/core';
import { NativeHttpModule } from 'core/native-http/nativeHttp.module';
import { AppInitializerModule } from './app-initializer.module';
import { NerdStatisticsComponent } from './nerd-statistics/nerd-statistics.component';

@NgModule({
  imports: [AppInitializerModule, NativeHttpModule],
  declarations: [NerdStatisticsComponent],
  exports: [NerdStatisticsComponent],
})
export class CoreModule {}
