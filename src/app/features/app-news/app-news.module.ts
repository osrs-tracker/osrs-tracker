import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { AppNewsPage } from './app-news.page';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AppNewsPage,
      },
    ]),
  ],
  declarations: [AppNewsPage],
})
export class AppNewsPageModule {}
