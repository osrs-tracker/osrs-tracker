import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NativeHttp } from 'src/app/core/native-http/nativeHttp';

@Injectable({
  providedIn: 'root',
})
export class OsrsWikiService {
  readonly OSRS_WIKI_API: string = 'https://oldschool.runescape.wiki/api.php';

  constructor(private nativeHttp: NativeHttp) {}

  searchWiki(query: string, limit: number = 10): Observable<{ keyword: string; url: string }[]> {
    return this.nativeHttp
      .get<[string, string[], string[], string[]]>(
        `${this.OSRS_WIKI_API}?action=opensearch&search=${query}&limit=${limit}`
      )
      .pipe(map(([, keywords, , urls]) => keywords.map((keyword, index) => ({ keyword, url: urls[index] }))));
  }
}
