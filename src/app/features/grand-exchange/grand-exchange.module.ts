import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ItemResultComponent } from './components/item-result/item-result.component';
import { PriceTrendComponent } from './components/price-trend/price-trend.component';
import { SearchItemComponent } from './components/search-item/search-item.component';
import { GrandExchangePage } from './grand-exchange.page';
import { GrandExchangeResolver } from './grand-exchange.resolver';
import { GrandExchangeRoute } from './grand-exchange.routes';
import { ItemComparePage } from './item-compare/item-compare.page';
import { ItemCompareResolver } from './item-compare/item-compare.resolver';
import { ItemDetailPage } from './item-detail/item-detail.page';
import { ItemDetailResolver } from './item-detail/item-detail.resolver';
import { ItemResultsPage } from './item-results/item-results.page';
import { ItemResultsResolver } from './item-results/item-results.resolver';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: GrandExchangePage,
        resolve: { cachedItems: GrandExchangeResolver },
      },
      {
        path: `${GrandExchangeRoute.ItemResults}/:query`,
        component: ItemResultsPage,
        resolve: { itemResults: ItemResultsResolver },
      },
      {
        path: `${GrandExchangeRoute.ItemDetails}/:id`,
        component: ItemDetailPage,
        resolve: { itemDetail: ItemDetailResolver },
      },
      {
        path: `${GrandExchangeRoute.ItemCompare}/:itemName/:compareItemName`,
        component: ItemComparePage,
        resolve: { itemCompare: ItemCompareResolver },
      },
    ]),
  ],
  declarations: [
    GrandExchangePage,
    ItemComparePage,
    ItemDetailPage,
    ItemResultsPage,
    ItemResultComponent,
    SearchItemComponent,
    PriceTrendComponent,
  ],
})
export class GrandExchangeModule {}
