import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const favoriteShrink = trigger('favoriteShrink', [
  transition(':leave', [
    group([
      query(
        'ion-list-header',
        [style({ 'max-height': 30, 'min-height': 30 }), animate('150ms', style({ 'max-height': 0, 'min-height': 0 }))],
        {
          optional: true,
        }
      ),
      query('ion-item-sliding', [style({ 'max-height': 60 }), animate('150ms', style({ 'max-height': 0 }))]),
      query('ion-item-sliding > ion-item', [animate('150ms', style({ transform: 'translate3d(-100%, 0, 0)' }))]),
    ]),
  ]),
]);
