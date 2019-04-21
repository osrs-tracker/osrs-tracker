import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { environment } from 'environments/environment';
import { ItemSearchModel } from 'services/item/item.model';
import { GrandExchangeRoute } from '../grand-exchange.routes';
import { ItemResultsCache } from './item-results-cache.service';

@Component({
  selector: 'page-item-results',
  templateUrl: './item-results.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemResultsPage implements OnInit, OnDestroy {
  readonly AppRoute = AppRoute;
  readonly environment = environment;

  items: ItemSearchModel[];
  title: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private itemResultsCache: ItemResultsCache,
    private navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.title = `Search: ${this.activatedRoute.snapshot.params.query}` || 'Search';
    this.items = (this.activatedRoute.snapshot.data.itemResults || []).filter((item: ItemSearchModel) => item.current);
    this.itemResultsCache.store(this.items);
  }

  itemDetails(item: ItemSearchModel): Promise<boolean> {
    return this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemDetails, item.id]);
  }

  trackByItemId(index: number, item: ItemSearchModel): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.itemResultsCache.clear();
  }
}
