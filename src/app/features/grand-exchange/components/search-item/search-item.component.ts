import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { GrandExchangeRoute } from 'features/grand-exchange/grand-exchange.routes';
import { forkJoin, Observable, timer } from 'rxjs';
import { AlertManager } from 'services/alert-manager/alert.manager';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { ItemResultComponent } from '../item-result/item-result.component';

@Component({
  selector: 'search-item',
  templateUrl: 'search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
})
export class SearchItemComponent implements OnInit {
  @Input() cachedItems: { favorites: string[]; recents: string[] };

  @ViewChildren(ItemResultComponent) itemResultComponents: ItemResultComponent[];

  favoriteItems: string[] = [];
  recentItems: string[] = [];

  constructor(
    private navCtrl: NavController,
    private alertManager: AlertManager,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.favoriteItems = this.cachedItems.favorites;
    this.recentItems = this.cachedItems.recents;
  }

  async updateFavorites(): Promise<void> {
    this.favoriteItems = await this.storageService.getValue<string[]>(StorageKey.FavoriteItems, []);
  }

  async updateRecent(): Promise<void> {
    this.recentItems = await this.storageService.getValue<string[]>(StorageKey.RecentItems, []);
  }

  refresh(): Observable<any> {
    return forkJoin([timer(500), ...(this.itemResultComponents || []).map(i => i.getData())]);
  }

  async searchItem(query: string): Promise<void> {
    query = query.trim();

    if (query.length < 3) {
      return this.alertManager.create({
        header: 'Empty search field',
        message: 'Enter at least 3 characters.',
        buttons: ['OK'],
      });
    }

    try {
      await this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemResults, query]);
    } catch (e) {
      this.alertManager.create({
        header: 'No results found',
        buttons: ['OK'],
      });
    }
  }

  trackByItemId(index: number, itemId: number): number {
    return itemId;
  }
}
