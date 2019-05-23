import { DEFAULT_IDENTITY } from './../const';
import { DropdownControl } from './../models/DropdownControl';
import { FormControlService } from './../services/form-control.service';
import { FormControlBase } from './../models/FormControlBase';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { IFormAction } from '../interfaces/IFormAction';
import { ControlTypes } from '../enums/control-types.enum';
import { CheckboxControl } from '../models/CheckboxControl';
import { HelperService } from '../services/helper.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  // unique form for service when update data
  @Input() identity = DEFAULT_IDENTITY;

  @Input() controls: FormControlBase<any>[] = [];
  @Input() actions: IFormAction;
  @Output() submit = new EventEmitter<any>();

  unsubscribe$ = new Subject<any>();

  form: FormGroup;
  defaultData: any;
  controlTypes = ControlTypes;

  constructor(private formControlService: FormControlService, private helperService: HelperService) {
    helperService.updateDrowdownOptions$.pipe(
      // make sure update correct form on per page
      filter(value => this.identifyFormInstance(value.identity)),
      takeUntil(this.unsubscribe$)
    ).subscribe(optionsData => {
      this.controls.map(c => {
        if(c.key === optionsData.controlKey) {
          (<DropdownControl>c).options = optionsData.options;
        }
        return c;
      })
    });

    helperService.setFormData$.pipe(
      // make sure update correct form on per page
      filter(value => this.identifyFormInstance(value.identity)),
      takeUntil(this.unsubscribe$)
    ).subscribe(formData => {
      this.updateFormData(formData.data);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get formControls() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formControlService.toFormGroup(this.controls);
    this.defaultData = this.formControlService.getControlsData(this.controls);
  }

  /**
   * Update form data
   * @param data
   */
  updateFormData(data: Object) {
    Object.keys(data).forEach(name => {
      const checkboxControl = this.controls.find(c => c.key === name && c.controlType === ControlTypes.CHECKBOX);
      let value;
      if (checkboxControl) {
        value = this.formControlService
                      .convertCheckboxesToFormData(
                        data[name], <CheckboxControl>checkboxControl
                      );
      } else {
        value = data[name];
      }

      if (this.form.get(name)) {
        this.form.get(name).patchValue(value, { onlySelf: true });
      }
    });
  }

  identifyFormInstance(identity: string): boolean {
    if(this.identity === DEFAULT_IDENTITY) {
      return true;
    }
    return identity === this.identity;
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.form.invalid) {
      this.formControlService.markFormGroupTouched(this.form);
      return false;
    }

    let formData = { ...this.form.value };
    formData = this.formControlService.getSelectedCheckboxesData(formData, this.controls);
    this.submit.emit(formData);
  }

  resetForm(e) {
    e.preventDefault();
    if (this.defaultData) {
      this.updateFormData(this.defaultData);
      return true;
    }
    return this.form.reset();
  }
}
