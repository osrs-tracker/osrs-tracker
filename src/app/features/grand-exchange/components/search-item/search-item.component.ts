import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AlertInput } from '@ionic/core';
import { forkJoin, Observable, timer } from 'rxjs';
import { AppRoute } from 'src/app/app-routing.routes';
import { favoriteShrink } from 'src/app/core/animations/delete-shrink.animation';
import { GrandExchangeRoute } from 'src/app/features/grand-exchange/grand-exchange.routes';
import { AlertManager } from 'src/app/services/alert-manager/alert.manager';
import { ItemSearchModel } from 'src/app/services/item/item.model';
import { StorageKey } from 'src/app/services/storage/storage-key';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ItemResultComponent } from '../item-result/item-result.component';

@Component({
  selector: 'search-item',
  templateUrl: 'search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
  animations: [favoriteShrink],
})
export class SearchItemComponent implements OnInit {
  @Input() cachedItems!: { favorites: string[]; recents: string[] };

  @ViewChildren(ItemResultComponent) itemResultComponents!: ItemResultComponent[];

  favoriteItems: string[] = [];
  recentItems: string[] = [];

  itemName = '';

  compare = false;
  compareItemName = '';

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private alertManager: AlertManager,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.favoriteItems = this.cachedItems.favorites;
    this.recentItems = this.cachedItems.recents;
  }

  async updateFavorites(): Promise<void> {
    this.favoriteItems = await this.storageService.getValue<string[]>(StorageKey.FavoriteItems, []);
  }

  async updateRecent(): Promise<void> {
    this.recentItems = await this.storageService.getValue<string[]>(StorageKey.RecentItems, []);
  }

  refresh(): Observable<any> {
    return forkJoin([timer(500), ...(this.itemResultComponents || []).map(i => i.getData())]);
  }

  async searchItem(): Promise<void> {
    this.itemName = this.itemName.trim();

    if (this.itemName.length < 3) {
      return this.alertManager.create({
        header: 'Empty search field',
        message: 'Enter at least 3 characters.',
        buttons: ['OK'],
      });
    }

    try {
      await this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemResults, this.itemName]);
    } catch (e) {
      this.alertManager.create({
        header: 'No results found',
        buttons: ['OK'],
      });
    }
  }

  async compareItem(): Promise<void> {
    this.itemName = this.itemName.trim();
    this.compareItemName = this.compareItemName.trim();

    if (this.itemName.length < 3 || this.compareItemName.length < 3) {
      return this.alertManager.create({
        header: 'Empty search field',
        message: 'Enter at least 3 characters.',
        buttons: ['OK'],
      });
    }

    try {
      await this.navCtrl.navigateForward([
        AppRoute.GrandExchange,
        GrandExchangeRoute.ItemCompare,
        this.itemName,
        this.compareItemName,
      ]);
    } catch ({ searchError, compareError, searchResponse, compareResponse }) {
      let errorHeader = 'Unknown error.';
      let errorMessage = 'Please check your internet connection.';
      if (searchError) {
        errorHeader = 'Search error';
        if (searchResponse.status === 204) {
          errorMessage = 'Could not find first item.';
        } else if (searchResponse.body && searchResponse.body.length > 1) {
          errorMessage = 'Multiple results found for first item.';
          this.selectMultipleFound('item', searchResponse.body);
        }
      } else if (compareError) {
        errorHeader = 'Compare error';
        if (compareResponse.status === 204) {
          errorMessage = 'Could not find compare item.';
        } else if (compareResponse.body && compareResponse.body.length > 1) {
          errorMessage = 'Multiple results found for compare item.';
          this.selectMultipleFound('compare', compareResponse.body);
        }
      }
      this.alertManager.create({
        header: errorHeader,
        message: errorMessage,
        buttons: ['OK'],
      });
    }
  }

  trackByItemId(_: number, itemId: number): number {
    return itemId;
  }

  private async selectMultipleFound(type: 'item' | 'compare', items: ItemSearchModel[]): Promise<any> {
    const alert = await this.alertCtrl.create({
      header: 'Select item',
      inputs: items.map(
        item =>
          ({
            name: item.name,
            type: 'radio',
            label: item.name,
            value: item.name,
          } as AlertInput)
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          handler: itemName => {
            type === 'item' ? (this.itemName = itemName) : (this.compareItemName = itemName);
            this.compareItem();
          },
        },
      ],
    });
    await alert.present();
  }
}
