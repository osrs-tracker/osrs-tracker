import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NativeHttp } from './nativeHttp';

@Injectable()
export class NativeHttpImplementation extends NativeHttp {

  constructor(
    private http: HTTP
  ) {
    super();
  }

  get<T>(url: string): Observable<T> {
    return from(this.http.get(url, {}, {}))
      .pipe(map(response => JSON.parse(response.data)));
  }

  getText(url: string): Observable<string> {
    return from(this.http.get(url, {}, {}))
      .pipe(map(response => response.data as string));
  }

}
