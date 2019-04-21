import { Observable } from 'rxjs';

export abstract class NativeHttp {
  abstract get<T>(url: string): Observable<T>;
  abstract getText(url: string): Observable<string>;
}
