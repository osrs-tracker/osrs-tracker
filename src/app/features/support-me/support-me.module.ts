import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatreonButtonComponent } from './components/patreon-button.component';
import { SupportMeComponent } from './support-me.page';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SupportMeComponent,
      },
    ]),
  ],
  declarations: [SupportMeComponent, PatreonButtonComponent],
})
export class SupportMeModule {}
