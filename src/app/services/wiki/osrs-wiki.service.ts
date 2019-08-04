import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class OsrsWikiService {
    constructor(private httpClient: HttpClient) { }

    searchWiki(query: string, limit?: number): Observable<{ keyword: string; url: string }[]> {
        return this.httpClient.get<{ keyword: string; url: string }[]>(
            `${environment.API_OSRS_TRACKER}/proxy/wiki/${query}`,
            { params: (limit ? { limit: limit.toString() } : {}) }
        );
    }
}
