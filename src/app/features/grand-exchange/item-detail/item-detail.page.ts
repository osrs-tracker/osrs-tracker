import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { AppRoute } from 'app-routing.routes';
import { ItemSearchModel } from 'services/item/item.model';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';

@Component({
  selector: 'page-item-detail',
  templateUrl: './item-detail.page.html',
  styleUrls: ['./item-detail.page.scss'],
})
export class ItemDetailPage {
  readonly AppRoute = AppRoute;

  item: ItemSearchModel;
  isFavorite = false;

  constructor(private activatedRoute: ActivatedRoute, private storageService: StorageService) {
    this.item = this.activatedRoute.snapshot.data.itemDetail;

    this.addItemToItemCache();
    this.addItemToRecents();

    this.storageService
      .getValue<string[]>(StorageKey.FavoriteItems, [])
      .then(favorites => (this.isFavorite = favorites.includes(this.item.id.toString())));
  }

  async toggleFavorite(): Promise<void> {
    this.isFavorite = await this.storageService.uniqueCacheToggle(StorageKey.FavoriteItems, this.item.id.toString());
    await this.addItemToRecents();
  }

  async openWiki(): Promise<void> {
    const url = `https://oldschool.runescape.wiki/w/${this.item.name}`;
    Plugins.Browser.open({
      url,
      toolbarColor: '#1e2023',
    });
  }

  private async addItemToRecents(): Promise<void> {
    const favoritedItems = await this.storageService.getValue(StorageKey.FavoriteItems, []);

    await this.storageService.limitedArrayPush(StorageKey.RecentItems, this.item.id.toString(), {
      maxLength: 5,
      blacklist: favoritedItems,
    });
  }

  private async addItemToItemCache(): Promise<void> {
    const cachedItems = await this.storageService.getValue<{ [id: number]: ItemSearchModel }>(
      StorageKey.CacheItems,
      {}
    );

    await this.storageService.setValue(StorageKey.CacheItems, {
      ...cachedItems,
      [this.item.id]: this.item,
    });
  }
}
