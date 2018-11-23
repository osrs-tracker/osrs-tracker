import { NgModule } from '@angular/core';
import { NotFoundPipe } from './not-found/not-found';
import { NumberFormatPipe } from './number-format/number-format';
@NgModule({
  declarations: [
    NotFoundPipe,
    NumberFormatPipe
  ],
  imports: [],
  exports: [
    NotFoundPipe,
    NumberFormatPipe
  ]
})
export class PipesModule { }
