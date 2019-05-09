import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'shared/shared.module';
import { OsrsWikiPage } from './osrs-wiki.page';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: OsrsWikiPage,
      },
    ]),
  ],
  declarations: [OsrsWikiPage],
})
export class OsrsWikiModule {}
