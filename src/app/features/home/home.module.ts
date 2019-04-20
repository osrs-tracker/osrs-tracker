import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { OSRSNewsComponent } from './components/osrs-news/osrs-news.component';
import { QuickNavComponent } from './components/quick-nav/quick-nav.component';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
      },
    ]),
  ],
  declarations: [HomePage, OSRSNewsComponent, QuickNavComponent],
})
export class HomePageModule {}
