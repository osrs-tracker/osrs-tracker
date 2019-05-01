import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppRoute } from './app-routing.routes';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: AppRoute.Home, loadChildren: './features/home/home.module#HomeModule' },
  { path: AppRoute.AppNews, loadChildren: './features/app-news/app-news.module#AppNewsModule' },
  {
    path: AppRoute.GrandExchange,
    loadChildren: './features/grand-exchange/grand-exchange.module#GrandExchangeModule',
  },
  { path: AppRoute.Hiscores, loadChildren: './features/hiscores/hiscores.module#HiscoresModule' },
  { path: AppRoute.XpTracker, loadChildren: './features/xp-tracker/xp-tracker.module#XpTrackerModule' },
  { path: AppRoute.Settings, loadChildren: './features/settings/settings.module#SettingsModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
