import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from 'src/environments/environment';

@Directive({
  selector: '[mobileOnly]',
})
export class MobileOnlyDirective implements OnInit {
  constructor(
    private container: ViewContainerRef,
    private template: TemplateRef<any>
  ) { }

  ngOnInit(): void {
    if (!environment.web) {
      this.container.createEmbeddedView(this.template);
    }
  }
}
