import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from './app-routing.routes';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: AppRoute.Home,
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
  },
  {
    path: AppRoute.AppNews,
    loadChildren: () => import('./features/app-news/app-news.module').then(m => m.AppNewsModule),
  },
  {
    path: AppRoute.GrandExchange,
    loadChildren: () => import('./features/grand-exchange/grand-exchange.module').then(m => m.GrandExchangeModule),
  },
  {
    path: AppRoute.Hiscores,
    loadChildren: () => import('./features/hiscores/hiscores.module').then(m => m.HiscoresModule),
  },
  {
    path: AppRoute.Settings,
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
  },
  {
    path: AppRoute.OSRSWiki,
    loadChildren: () => import('./features/osrs-wiki/osrs-wiki.module').then(m => m.OsrsWikiModule),
  },
  {
    path: AppRoute.XpTracker,
    loadChildren: () => import('./features/xp-tracker/xp-tracker.module').then(m => m.XpTrackerModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
