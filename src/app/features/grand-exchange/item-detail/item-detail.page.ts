import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AppRoute } from 'app-routing.routes';
import { environment } from 'environments/environment';
import { getTrendClass, ItemSearchModel } from 'services/item/item.model';
import { StorageProvider } from 'services/storage/storage';

@Component({
  selector: 'page-item-detail',
  templateUrl: './item-detail.page.html',
  styleUrls: ['./item-detail.page.scss']
})
export class ItemDetailPage {
  readonly AppRoute = AppRoute;

  item: ItemSearchModel = ItemSearchModel.empty();
  isFavorite = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private browserTab: BrowserTab,
    private inAppBrowser: InAppBrowser,
    private storageProvider: StorageProvider
  ) {
    this.item = this.activatedRoute.snapshot.data.itemDetail;
    this.item.icon = this.item.icon || `${environment.API_GEPT}/icon/${this.item.id}`;
    this.item.trendClass = this.item.trendClass || getTrendClass(this.item.today);
    this.storageProvider.addItemToCache(this.item.id, this.item);

    this.storageProvider.getFavoriteItems(
      favorites => this.isFavorite = (favorites || []).includes(`${this.item.id}`)
    );
    this.storageProvider.addToRecentItems(`${this.item.id}`);
  }

  toggleFavorite() {
    this.storageProvider.toggleFavoriteItem(`${this.item.id}`, isFavorited => (this.isFavorite = isFavorited));
  }

  openWiki() {
    const url = `https://oldschool.runescape.wiki/w/${this.item.name}`;
    this.browserTab.isAvailable()
      .then(isAvailabe => isAvailabe ?
        this.browserTab.openUrl(url) :
        this.inAppBrowser.create(url, '_system')
      );
  }

}
