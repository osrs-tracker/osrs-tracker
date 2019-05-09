import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeHttp } from 'app/core/native-http/nativeHttp';
import { plainToClass } from 'class-transformer';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemDetailModel, ItemSearchModel } from './item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private httpClient: HttpClient, private nativeHttp: NativeHttp) {}

  searchItems(query: string): Observable<HttpResponse<ItemSearchModel[]>> {
    return this.httpClient
      .get<ItemSearchModel[]>(`${environment.API_GEPT}/item`, {
        params: { query },
        observe: 'response',
      })
      .pipe(map(res => Object.assign(res, { body: plainToClass(ItemSearchModel, res.body) })));
  }

  getItem(id: number): Observable<ItemSearchModel | null> {
    return this.httpClient
      .get<ItemSearchModel[]>(`${environment.API_GEPT}/item/${id}`)
      .pipe(map(items => (items ? plainToClass(ItemSearchModel, items[0]) : null)));
  }

  itemIcon(id: number): string {
    return `${environment.API_GEPT}/icon/${id}`;
  }

  itemGraph(id: number): Observable<any> {
    return this.nativeHttp.get(`${environment.API_RUNESCAPE}/m=itemdb_oldschool/api/graph/${id}.json`);
  }

  itemDetails(id: number): Observable<ItemDetailModel> {
    return this.nativeHttp
      .get<{ item: ItemDetailModel }>(
        `${environment.API_RUNESCAPE}/m=itemdb_oldschool/api/catalogue/detail.json?item=${id}`
      )
      .pipe(map(response => response.item));
  }
}
