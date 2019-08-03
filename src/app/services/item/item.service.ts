import { HttpClient, HttpParams, HttpResponse, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ItemDetailModel, ItemSearchModel } from './item.model';

// WORKAROUND FOR: https://github.com/angular/angular/issues/18884
class UrlParameterEncodingCodec extends HttpUrlEncodingCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private httpClient: HttpClient) { }

  searchItems(query: string): Observable<HttpResponse<ItemSearchModel[]>> {
    return this.httpClient
      .get<ItemSearchModel[]>(`${environment.API_GEPT}/item`, {
        params: new HttpParams({
          fromObject: { query },
          encoder: new UrlParameterEncodingCodec(),
        }),
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
    return this.httpClient.get<any>(`${environment.API_GEPT}/proxy/item/${id}/graph`);
  }

  itemDetails(id: number): Observable<ItemDetailModel> {
    return this.httpClient.get<ItemDetailModel>(`${environment.API_GEPT}/proxy/item/${id}`);
  }
}
