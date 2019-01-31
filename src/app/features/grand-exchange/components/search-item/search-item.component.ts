import { Component, ViewChildren } from '@angular/core';
import { IonList, NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { GrandExchangeRoute } from 'features/grand-exchange/grand-exchange.routes';
import { forkJoin, Observable, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { ItemResultComponent } from '../item-result/item-result.component';

@Component({
  selector: 'search-item',
  templateUrl: 'search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent {
  @ViewChildren(ItemResultComponent) itemFavoriteComponents: ItemResultComponent[];
  favoriteItems: string[] = [];
  recentItems: string[] = [];

  constructor(
    private navCtrl: NavController,
    private alertManager: AlertManager,
    private storageService: StorageService
  ) {
    this.updateFavorites();
    this.updateRecent();
  }

  async updateFavorites(list?: IonList) {
    await this.storageService.getValue<string[]>(StorageKey.FavoriteItems)
      .then(favorites => this.favoriteItems = favorites)
      .then(() => list && list.closeSlidingItems());
  }

  async updateRecent(list?: IonList) {
    await this.storageService.getValue<string[]>(StorageKey.RecentItems)
      .then(recents => this.recentItems = recents)
      .then(() => list && list.closeSlidingItems());
  }

  refresh(): Observable<any> {
    return forkJoin([timer(500), ...(this.itemFavoriteComponents || []).map(fav => fav.getData())]);
  }

  async searchItem(query: string) {
    query = query.trim();
    if (query.length > 2) {
      this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemResults, query])
        .catch(() => this.alertManager.create({
          header: 'No results found',
          buttons: ['OK']
        }));
    } else {
      this.alertManager.create({
        header: 'Empty search field',
        message: 'Enter at least 3 characters.',
        buttons: ['OK']
      });
    }

  }

  trackByItemId(index: number, itemId: number) {
    return itemId;
  }

}
