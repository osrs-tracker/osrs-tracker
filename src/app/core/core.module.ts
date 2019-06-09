import { NgModule } from '@angular/core';
import { AppInitializerModule } from './app-initializer.module';
import { NativeHttpModule } from './native-http/nativeHttp.module';
import { NerdStatisticsComponent } from './nerd-statistics/nerd-statistics.component';

@NgModule({
  imports: [AppInitializerModule, NativeHttpModule],
  declarations: [NerdStatisticsComponent],
  exports: [NerdStatisticsComponent],
})
export class CoreModule {}
