import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ItemProvider } from 'services/item/item';
import { ItemSearchModel } from 'services/item/item.model';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { GrandExchangeRoute } from '../../grand-exchange.routes';

@Component({
  selector: 'item-result',
  templateUrl: './item-result.component.html',
  styleUrls: ['./item-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemResultComponent implements OnInit {
  @Input() itemId: string | null = null;
  @Input() item: ItemSearchModel | null = null;
  @Input() slide = false;

  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  loading = true;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private itemService: ItemProvider,
    private storageService: StorageService,
    private navCtrl: NavController
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.itemId && !this.item) {
      const items = await this.storageService.getValue<ItemSearchModel>(StorageKey.CacheItems, {} as ItemSearchModel);
      this.item = items[this.itemId];
      this.getData().subscribe();
    } else {
      this.loading = false;
    }
  }

  getData(): Observable<ItemSearchModel | null> {
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    return this.itemService.getItem(Number(this.itemId)).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      tap(item => (this.item = item))
    );
  }

  async goToDetails(): Promise<void> {
    await this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemDetails, this.item!.id]);
  }

  async deleteItem(): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteItems, this.item!.id.toString());
    await this.storageService.removeFromArray(StorageKey.RecentItems, this.item!.id.toString());
    this.delete.emit();
  }
}
