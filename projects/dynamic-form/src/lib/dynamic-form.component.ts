import { FormControlService } from './../services/form-control.service';
import { FormControlBase } from './../models/FormControlBase';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IAction } from '../interfaces/IAction';
import { IFormAction } from '../interfaces/IFormAction';
import { DropdownControl } from '../models/DropdownControl';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() controls: FormControlBase<any>[] = [];
  @Input() actions: IFormAction;
  @Output() submit = new EventEmitter<any>();
  form: FormGroup;

  constructor(private formControlService: FormControlService) { }

  get formControls() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formControlService.toFormGroup(this.controls);
  }

  resetForm() {
    this.form.reset();
  }

  /**
   * Get selected checkboxes data
   * @param formData
   */
  private getSelectedCheckboxesData(formData: any) {
    let checkboxControls = this.controls.filter(c => c.controlType === 'CHECKBOX');
    if(checkboxControls.length) {
      for(let key in formData) {
        const control = <DropdownControl>checkboxControls.find(c => c.key === key);
        if(!control) {
          continue;
        }

        const options = control.options || [];

        if(formData[key].length !== options.length) {
          throw Error(`Checkboxes and options doesn't equal.`);
        }
        const checkboxesData = [];
        for(let i = 0; i < formData[key].length; i++) {
          if(formData[key][i] === true) {
            checkboxesData.push(options[i]);
          }
        }

        formData[key] = checkboxesData;
      }
    }
    return formData;
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.form.invalid) {
      this.formControlService.markFormGroupTouched(this.form);
      return false;
    }

    let formData = {...this.form.value};
    formData = this.getSelectedCheckboxesData(formData);
    this.submit.emit(formData);
  }
}
