import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';

@Component({
  selector: 'web-view',
  template: `
      <div class="web-view-content" [ngClass]="isDevice ? 'web-view-content--device' : 'web-view-content--browser'">
        <ng-content></ng-content>
      </div>
  `,
  styles: [
    `.osrs-tracker-web :host {
      display: block;
      height: 100%;
      width: 100%;
      max-width: 1024px;
      margin: 0 auto;
    }`,
    `.web-view-content--browser {
      padding: 32px 0;
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebViewComponent {

  isDevice: boolean;

  constructor() {
    this.isDevice = window.innerWidth < 992;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.isDevice = (event.target as Window).innerWidth < 992;
  }

}
