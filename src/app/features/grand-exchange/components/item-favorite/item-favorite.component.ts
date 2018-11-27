import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  selector: 'item-favorite',
  templateUrl: './item-favorite.component.html',
  styleUrls: ['./item-favorite.component.scss']
})
export class ItemFavoriteComponent implements OnInit {

  @Input() itemId: string;
  @Output() itemSelect = new EventEmitter<ItemSearchModel>();

  item = ItemSearchModel.empty();
  totalLevel: string;
  combatLevel: string;

  loading = true;

  constructor(
    private itemService: ItemProvider,
    private storageProvider: StorageProvider,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.storageProvider.getItemFromCache(this.itemId).then(item => {
      if (!item) { return; }
      this.item.id = +this.itemId;
      this.item.name = item.name;
      this.item.description = item.description;
    });
    this.getData().subscribe();
  }

  getData(): Observable<ItemSearchModel> {
    this.loading = true;
    return this.itemService.getItem(+this.itemId).pipe(
      finalize(() => this.loading = false),
      tap(item => {
        this.item = item;
        this.item.trendClass = getTrendClass(this.item.today);
        this.item.icon = `${environment.API_GEPT}/icon/${this.item.id}`;
      })
    );
  }

  goToDetails() {
    this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemDetails, this.item.id], true);
  }

}
