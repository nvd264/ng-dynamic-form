import { FormControlService } from './../services/form-control.service';
import { FormControlBase } from './../models/FormControlBase';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IFormAction } from '../interfaces/IFormAction';
import { ControlTypes } from '../enums/control-types.enum';
import { CheckboxControl } from '../models/CheckboxControl';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() controls: FormControlBase<any>[] = [];
  @Input() actions: IFormAction;
  @Input() asyncData: any;
  @Output() submit = new EventEmitter<any>();

  form: FormGroup;
  defaultData: any;
  controlTypes = ControlTypes;

  constructor(private formControlService: FormControlService) { }

  get formControls() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formControlService.toFormGroup(this.controls);
    this.defaultData = this.formControlService.getControlsData(this.controls);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['asyncData'] && changes['asyncData'].currentValue) {
      this.updateFormData(changes['asyncData'].currentValue);
    }
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
