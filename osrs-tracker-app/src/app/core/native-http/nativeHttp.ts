import { Observable } from 'rxjs';

export abstract class NativeHttp {
  abstract get<T>(url): Observable<T>;
  abstract getText(url: string): Observable<string>;
}
