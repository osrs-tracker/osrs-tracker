import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ItemResultComponent } from './components/item-result/item-result.component';
import { SearchItemComponent } from './components/search-item/search-item.component';
import { GrandExchangePage } from './grand-exchange.page';
import { GrandExchangeRoute } from './grand-exchange.routes';
import { ItemDetailPage } from './item-detail/item-detail.page';
import { ItemDetailResolver } from './item-detail/item-detail.resolver';
import { PriceTrendComponent } from './item-detail/price-trend/price-trend.component';
import { ItemResultsPage } from './item-results/item-results.page';
import { ItemResultsResolver } from './item-results/item-results.resolver';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: GrandExchangePage },
      { path: `${GrandExchangeRoute.ItemResults}/:query`, component: ItemResultsPage, resolve: { itemResults: ItemResultsResolver } },
      { path: `${GrandExchangeRoute.ItemDetails}/:id`, component: ItemDetailPage, resolve: { itemDetail: ItemDetailResolver } }
    ])
  ],
  declarations: [
    GrandExchangePage,
    ItemDetailPage,
    ItemResultsPage,
    ItemResultComponent,
    SearchItemComponent,
    PriceTrendComponent
  ]
})
export class GrandExchangePageModule {}
