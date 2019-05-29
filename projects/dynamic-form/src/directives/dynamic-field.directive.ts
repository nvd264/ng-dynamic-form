import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appDynamicField]'
})
export class DynamicFieldDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
