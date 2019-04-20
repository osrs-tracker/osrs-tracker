import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'shared/shared.module';
import { SettingsPage } from './settings.page';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsPage,
      },
    ]),
  ],
  declarations: [SettingsPage],
})
export class SettingsPageModule {}
