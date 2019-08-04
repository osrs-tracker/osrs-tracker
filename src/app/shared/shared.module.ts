import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SkillIconComponent } from './components/skill-icon/skill-icon.component';
import { PipesModule } from './pipes/pipes.module';
import { WebViewComponent } from './components/web-view/web-view.component';
import { MobileOnlyDirective } from './directives/mobile-only.directive';
import { WebOnlyDirective } from './directives/web-only.directive';

const MODULES = [CommonModule, IonicModule, PipesModule];

const COMPONENTS = [SkillIconComponent, WebViewComponent];
const DIRECTIVES = [MobileOnlyDirective, WebOnlyDirective];

@NgModule({
  imports: MODULES,
  declarations: [...COMPONENTS, ...DIRECTIVES],
  exports: [...MODULES, ...COMPONENTS, ...DIRECTIVES],
})
export class SharedModule { }
