import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ItemSearchModel } from 'src/app/services/item/item.model';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemResultsCache } from '../item-results/item-results-cache.service';

@Injectable({
  providedIn: 'root',
})
export class ItemDetailResolver implements Resolve<ItemSearchModel | null> {
  constructor(
    private itemService: ItemService,
    private itemResultsCache: ItemResultsCache,
    private loadCtrl: LoadingController
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<ItemSearchModel | null> {
    const cachedResults = this.itemResultsCache.get();
    const foundItem = cachedResults.find(item => item.id === Number(route.params.id));
    if (foundItem) {
      return Promise.resolve(foundItem);
    }

    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    await loader.present();
    return this.itemService
      .getItem(route.params.id)
      .pipe(finalize(() => loader.dismiss()))
      .toPromise();
  }
}
