import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ItemProvider } from 'services/item/item';
import { getTrendClass, ItemSearchModel } from 'services/item/item.model';
import { StorageProvider } from 'services/storage/storage';
import { GrandExchangeRoute } from '../../grand-exchange.routes';

@Component({
  selector: 'item-result',
  templateUrl: './item-result.component.html',
  styleUrls: ['./item-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemResultComponent implements OnInit {

  @Input() itemId: string = null;
  @Input() item: ItemSearchModel = null;

  loading = true;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private itemService: ItemProvider,
    private storageProvider: StorageProvider,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    if (this.itemId && !this.item) {
      this.item = ItemSearchModel.empty();
      await this.storageProvider.getItemFromCache(this.itemId).then(item => {
        if (!item) { return; }
        this.item = item;
      });
      this.getData().subscribe();
    } else {
      this.loading = false;
    }
  }

  getData(): Observable<ItemSearchModel> {
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    return this.itemService.getItem(+this.itemId).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      tap(item => {
        this.item = item;
        this.item.trendClass = getTrendClass(this.item.today);
        this.item.icon = `${environment.API_GEPT}/icon/${this.item.id}`;
      })
    );
  }

  goToDetails(): void {
    this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemDetails, this.item.id], true);
  }

}
