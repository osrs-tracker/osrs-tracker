import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemProvider } from 'services/item/item';
import { ItemSearchModel } from 'services/item/item.model';
import { map, finalize } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { ItemResultsCache } from '../item-results/item-results-cache.service';

@Injectable({
  providedIn: 'root'
})
export class ItemDetailResolver implements Resolve<ItemSearchModel> {

  constructor(
    private itemProvider: ItemProvider,
    private itemResultsCache: ItemResultsCache,
    private loadCtrl: LoadingController
  ) { }

  async resolve(route: ActivatedRouteSnapshot): Promise<ItemSearchModel> {
    const cachedResults = this.itemResultsCache.get();
    const foundItem = cachedResults.find(item => item.id === Number(route.params.id));
    if (foundItem) {
      return Promise.resolve(foundItem);
    }

    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    await loader.present();
    return this.itemProvider.getItem(route.params.id)
      .pipe(finalize(() => loader.dismiss()))
      .toPromise();
  }

}
