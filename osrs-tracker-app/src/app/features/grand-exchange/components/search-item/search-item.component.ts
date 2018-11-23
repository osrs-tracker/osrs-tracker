import { Component, Input, ViewChildren } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { GrandExchangeRoute } from 'features/grand-exchange/grand-exchange.routes';
import { forkJoin, Observable, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert-manager';
import { StorageProvider } from 'services/storage/storage';
import { ItemFavoriteComponent } from '../item-favorite/item-favorite.component';

@Component({
  selector: 'search-item',
  templateUrl: 'search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent {
  @Input() favorites = true;
  @Input() recents = true;

  @ViewChildren(ItemFavoriteComponent) itemFavoriteComponents: ItemFavoriteComponent[];
  favoriteItems: string[] = [];
  recentItems: string[] = [];

  constructor(
    public navCtrl: NavController,
    public alertManager: AlertManager,
    public loadCtrl: LoadingController,
    private storageProvider: StorageProvider
  ) {
    this.storageProvider.getItems(
      favorites => this.favoriteItems = favorites,
      recents => this.recentItems = recents
    );
  }

  public updateFavorites() {
    this.storageProvider.getFavoriteItems(favorites => this.favoriteItems = favorites);
  }

  public updateRecent() {
    this.storageProvider.getRecentItems(recents => this.recentItems = recents);
  }

  public refresh(): Observable<any> {
    return forkJoin(
      timer(500),
      ...(this.itemFavoriteComponents || []).map(fav => fav.getData())
    );
  }

  async searchItem(query: string) {
    query = query.trim();
    if (query.length > 2) {
      this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemResults, query], true)
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
