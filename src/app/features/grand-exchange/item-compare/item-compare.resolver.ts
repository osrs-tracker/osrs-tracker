import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ItemSearchModel } from 'src/app/services/item/item.model';
import { ItemService } from 'src/app/services/item/item.service';

@Injectable({
  providedIn: 'root',
})
export class ItemCompareResolver implements Resolve<[ItemSearchModel, ItemSearchModel]> {
  constructor(private itemService: ItemService, private loadCtrl: LoadingController) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<[ItemSearchModel, ItemSearchModel]> {
    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    await loader.present();

    return forkJoin([
      this.itemService.searchItems(route.params.itemName),
      this.itemService.searchItems(route.params.compareItemName),
    ])
      .pipe(
        finalize(() => loader.dismiss()),
        map(([searchResponse, compareResponse]) => {
          if (!searchResponse.body || !compareResponse.body) {
            throw {
              searchError: !searchResponse.body,
              searchResponse,
              compareError: !compareResponse.body,
              compareResponse,
            };
          }

          let searchResult: ItemSearchModel | undefined;
          let compareResult: ItemSearchModel | undefined;

          if (searchResponse.body.length > 1) {
            const found = searchResponse.body.find(
              i => i.name.toLocaleLowerCase() === route.params.itemName.toLocaleLowerCase()
            );
            if (found) {
              searchResult = found;
            }
          } else {
            searchResult = searchResponse.body[0];
          }

          if (compareResponse.body.length > 1) {
            const found = compareResponse.body.find(
              i => i.name.toLocaleLowerCase() === route.params.compareItemName.toLocaleLowerCase()
            );
            if (found) {
              compareResult = found;
            }
          } else {
            compareResult = compareResponse.body[0];
          }

          if (!searchResult || !compareResult) {
            throw {
              searchError: !searchResult,
              searchResponse,
              compareError: !compareResult,
              compareResponse,
            };
          }

          return [searchResult, compareResult] as [ItemSearchModel, ItemSearchModel];
        })
      )
      .toPromise();
  }
}
