import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppRoute } from 'src/app/app-routing.routes';
import { ItemSearchModel } from 'src/app/services/item/item.model';
import { StorageKey } from 'src/app/services/storage/storage-key';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'page-item-compare',
  templateUrl: './item-compare.page.html',
  styleUrls: ['./item-compare.page.scss'],
})
export class ItemComparePage {
  readonly AppRoute: typeof AppRoute = AppRoute;

  searchItem: ItemSearchModel;
  compareItem: ItemSearchModel;

  constructor(activatedRoute: ActivatedRoute, private storageService: StorageService) {
    const [searchItem, compareItem] = activatedRoute.snapshot.data.itemCompare;
    this.searchItem = searchItem;
    this.compareItem = compareItem;

    this.addItemsToItemCache();
    this.addItemsToRecents();
  }

  private async addItemsToRecents(): Promise<void> {
    const favoritedItems = await this.storageService.getValue(StorageKey.FavoriteItems, []);

    await this.storageService.limitedArrayPush(StorageKey.RecentItems, this.searchItem.id.toString(), {
      maxLength: 5,
      blacklist: favoritedItems,
    });
    await this.storageService.limitedArrayPush(StorageKey.RecentItems, this.compareItem.id.toString(), {
      maxLength: 5,
      blacklist: favoritedItems,
    });
  }

  private async addItemsToItemCache(): Promise<void> {
    const cachedItems = await this.storageService.getValue<{ [id: number]: ItemSearchModel }>(
      StorageKey.CacheItems,
      {}
    );

    await this.storageService.setValue(StorageKey.CacheItems, {
      ...cachedItems,
      [this.searchItem.id]: this.searchItem,
      [this.compareItem.id]: this.compareItem,
    });
  }
}
