import { Component, ViewChildren } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
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
    private loadCtrl: LoadingController,
    private storageService: StorageService
  ) {
    this.updateFavorites();
    this.updateRecent();
  }

  updateFavorites() {
    this.storageService.getValue<string[]>(StorageKey.FavoriteItems)
      .then(favorites => this.favoriteItems = favorites);
  }

  updateRecent() {
    this.storageService.getValue<string[]>(StorageKey.RecentItems)
      .then(recents => this.recentItems = recents);
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
