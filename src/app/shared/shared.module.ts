import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SkillIconComponent } from './components/skill-icon/skill-icon.component';
import { PipesModule } from './pipes/pipes.module';

const MODULES = [
  CommonModule,
  IonicModule,
  PipesModule
];

const COMPONENTS = [
  SkillIconComponent
];

@NgModule({
  imports: MODULES,
  declarations: COMPONENTS,
  exports: [
    ...MODULES,
    ...COMPONENTS
  ]
})
export class SharedModule { }
