import { Component, DoCheck } from '@angular/core';

@Component({
  selector: 'nerd-statistics',
  template: `
    <div class="nerd-statistics">{{ changeDetectionCounter }}</div>
  `,
  styles: [
    `
      div.nerd-statistics {
        position: fixed;
        z-index: 9999;
        bottom: 20px;
        right: 0;

        background: green;
        color: white;

        padding: 1px 10px;
        border-radius: 5px 0 0 5px;
      }
    `,
  ],
})
export class NerdStatisticsComponent implements DoCheck {
  changeDetectionCounter = 0;

  ngDoCheck(): void {
    this.changeDetectionCounter++;
  }
}
