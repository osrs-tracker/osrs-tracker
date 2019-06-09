import { Injectable } from '@angular/core';
import { ItemSearchModel } from 'src/app/services/item/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemResultsCache {
  private itemResults: ItemSearchModel[] = [];

  store(searchResults: ItemSearchModel[]): void {
    this.itemResults = searchResults;
  }

  get(): ItemSearchModel[] {
    return this.itemResults;
  }

  clear(): void {
    this.itemResults = [];
  }
}
