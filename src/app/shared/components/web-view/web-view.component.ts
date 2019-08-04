import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'web-view',
  template: `<div class="web-view-content"><ng-content></ng-content></div>`,
  styles: [
    `.osrs-tracker-web :host {
      display: block;
      height: 100%;
      width: 100%;
      max-width: 1024px;
      margin: 0 auto;
    }`,
    `.web-view-content {
      margin: 32px 0;
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebViewComponent { }
