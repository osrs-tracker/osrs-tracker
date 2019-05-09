import { Component } from '@angular/core';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { OsrsWikiService } from 'services/wiki/osrs-wiki.service';

@Component({
  selector: 'osrs-wiki',
  templateUrl: './osrs-wiki.page.html',
  styleUrls: ['./osrs-wiki.page.scss'],
})
export class OsrsWikiPage {
  searchResults: { keyword: string; url: string }[] = [];

  constructor(
    private browserTab: BrowserTab,
    private inAppBrowser: InAppBrowser,
    private loadCtrl: LoadingController,
    private osrsWikiService: OsrsWikiService
  ) {}

  async searchWiki(query: string): Promise<void> {
    const loader = await this.loadCtrl.create({ message: 'Please wait...' });
    loader.present();

    this.osrsWikiService
      .searchWiki(query, 50)
      .pipe(finalize(() => loader.dismiss()))
      .subscribe({
        next: results => (this.searchResults = results),
      });
  }

  async openInBrowser(url: string): Promise<void> {
    if (await this.browserTab.isAvailable()) {
      this.browserTab.openUrl(url);
    } else {
      this.inAppBrowser.create(url, '_system');
    }
  }
}
