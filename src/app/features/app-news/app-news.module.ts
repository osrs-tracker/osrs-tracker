import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppNewsPage } from './app-news.page';
import { AppNewsResolver } from './app-news.resolver';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AppNewsPage,
        resolve: {
          cachedNewsItems: AppNewsResolver,
        },
      },
    ]),
  ],
  declarations: [AppNewsPage],
})
export class AppNewsModule {}
