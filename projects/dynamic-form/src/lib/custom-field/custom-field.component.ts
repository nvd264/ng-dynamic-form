import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { DynamicFieldDirective } from '../../directives/dynamic-field.directive';
import { CustomFieldControl } from '../../models/CustomFieldControl';

@Component({
  selector: 'custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss']
})
export class CustomFieldComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() control: CustomFieldControl;
  @ViewChild(DynamicFieldDirective) customFieldHost: DynamicFieldDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }


  loadComponent() {
    let componentFactory = this.componentFactoryResolver
                                .resolveComponentFactory(this.control.component);
    let viewContainerRef = this.customFieldHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance['form'] = this.form;
    componentRef.instance['controlKey'] = this.control.key;
  }
}
