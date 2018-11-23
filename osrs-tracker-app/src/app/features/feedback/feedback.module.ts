import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'shared/shared.module';
import { FeedbackPage } from './feedback.page';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: FeedbackPage
      }
    ])
  ],
  declarations: [
    FeedbackPage,
  ]
})
export class FeedbackPageModule { }
