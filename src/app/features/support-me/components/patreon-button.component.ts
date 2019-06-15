import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'patreon-button',
  template: `
    <a href="https://www.patreon.com/freek_mencke" class="patreon-button">
      <img src="./assets/imgs/patreon.svg" />
      <div>Become a patron</div>
    </a>
  `,
  styles: [
    `
      .patreon-button {
        background-color: rgb(232, 91, 70);
        display: flex;
        margin: 10px;
        padding: 12px;
        justify-content: center;
        border-radius: 4px;
        text-decoration: none;
      }
      .patreon-button img {
        max-height: 24px;
        max-width: 24px;
      }
      .patreon-button div {
        font-size: 24px;
        line-height: 24px;
        color: white;
        padding-left: 12px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatreonButtonComponent {}
