import { NgModule } from '@angular/core';
import { NativeHttpModule } from './native-http/nativeHttp.module';
import { NerdStatisticsComponent } from './nerd-statistics/nerd-statistics.component';

@NgModule({
  imports: [NativeHttpModule],
  declarations: [NerdStatisticsComponent],
  exports: [NerdStatisticsComponent],
})
export class CoreModule {}
