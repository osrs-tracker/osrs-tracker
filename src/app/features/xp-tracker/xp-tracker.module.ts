import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'shared/shared.module';
import { SearchXpComponent } from './components/search-xp/search-xp.component';
import { XpFavoriteComponent } from './components/xp-favorite/xp-favorite.component';
import { XpTrackerRoute } from './hiscores.routes';
import { XpTrackerAdventureLogPage } from './xp-tracker-adventure-log/xp-tracker-adventure-log.page';
import { XpTrackerDataTablePage } from './xp-tracker-data-table/xp-tracker-data-table.page';
import { XpTrackerViewPage } from './xp-tracker-view/xp-tracker-view.page';
import { XpTrackerViewResolver } from './xp-tracker-view/xp-tracker-view.resolver';
import { XpTrackerPage } from './xp-tracker.page';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: XpTrackerPage },
      {
        path: `${XpTrackerRoute.View}/:player`,
        component: XpTrackerViewPage,
        children: [
          { path: XpTrackerRoute.AdventureLog, outlet: XpTrackerRoute.AdventureLog, component: XpTrackerAdventureLogPage },
          { path: XpTrackerRoute.DataTable, outlet: XpTrackerRoute.DataTable, component: XpTrackerDataTablePage },
        ],
        resolve: {
          period: XpTrackerViewResolver
        }
      },
    ])
  ],
  declarations: [
    XpTrackerPage,
    XpTrackerViewPage,
    XpTrackerAdventureLogPage,
    XpTrackerDataTablePage,
    SearchXpComponent,
    XpFavoriteComponent
  ],
  providers: [
    DatePipe
  ]
})
export class XpTrackerPageModule { }
