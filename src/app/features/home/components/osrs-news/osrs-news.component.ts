import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { NewsItemOSRS } from 'src/app/services/news/news.service';

@Component({
  selector: 'osrs-news',
  templateUrl: './osrs-news.component.html',
  styleUrls: ['./osrs-news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OSRSNewsComponent {
  @Input() newsItems: NewsItemOSRS[];

  openInBrowser(url: string): Promise<void> {
    return Plugins.Browser.open({ url, toolbarColor: '#1e2023' });
  }

  trackByNewsItemDate(index: number, newsItem: NewsItemOSRS): Date {
    return newsItem.pubDate;
  }
}
