import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'support-me',
  templateUrl: './support-me.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportMeComponent {}
