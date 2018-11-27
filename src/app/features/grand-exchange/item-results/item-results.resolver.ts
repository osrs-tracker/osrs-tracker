import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { finalize, mergeMap } from 'rxjs/operators';
import { ItemProvider } from 'services/item/item';
import { ItemSearchModel } from 'services/item/item.model';
import { ItemResultsCache } from './item-results-cache.service';

@Injectable({
  providedIn: 'root'
})
export class ItemResultsResolver implements Resolve<ItemSearchModel[]> {

  constructor(
    private itemProvider: ItemProvider,
    private itemResultsCache: ItemResultsCache,
    private loadCtrl: LoadingController
  ) { }

  async resolve(route: ActivatedRouteSnapshot): Promise<ItemSearchModel[]> {
    const cachedResults = this.itemResultsCache.get();
    if (cachedResults.length > 0) {
      return Promise.resolve(cachedResults);
    }

    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    await loader.present();
    return this.itemProvider.searchItems(route.params.query).pipe(
      finalize(() => loader.dismiss()),
      mergeMap(response => response.status === 204 ? throwError(204) : of(response.body))
    ).toPromise();
  }

}