import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NativeHttp } from './nativeHttp';

@Injectable()
export class AngularHttpImplementation extends NativeHttp {

  constructor(
    private http: HttpClient
  ) {
    super();
  }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getText(url: string): Observable<string> {
    return this.http.get(url, {
      responseType: 'text'
    });
  }

}

