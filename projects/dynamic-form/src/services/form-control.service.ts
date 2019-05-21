import { FormErrorService } from './form-error.service';
import { FormControlBase } from './../models/FormControlBase';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { minSelectedCheckboxes } from '../validators/min-checkbox.directive';

@Injectable({
  providedIn: 'root'
})
export class FormControlService {
  constructor(private formErrorService: FormErrorService) {}

  /**
   * Convert controls into form group
   * @params controls
   * @returns form group instance
   */
  toFormGroup(controls: FormControlBase<any>[]) {
    const group: any = {};

    controls.forEach(c => {
      if (c.controlType === 'CHECKBOX') {
        group[c.key] = this.generateCheckboxes(c);
      } else {
        const validators = this.formErrorService.getValidatesInstance(c.validators);
        group[c.key] = new FormControl(c.value || '', validators);
      }
    });
    return new FormGroup(group);
  }

  /**
   * Generate FormArray check boxes
   * @param control <FormControlBase>
   * @returns <FormArray>
   */
  private generateCheckboxes(control: FormControlBase<any>) {
    const chkControls = control['options'].map(opt => {
      // set checked for checkbox if value equal option
      const value = control['labelValue'] || 'value';
      let checked = false;
      if (Array.isArray(control.value)) {
        checked = control.value.indexOf(opt[value]) !== -1;
      } else {
        checked = opt[value] === control.value;
      }
      return new FormControl(checked);
    });
    // set required validate for checkbox
    const validators = this.formErrorService.getValidatesInstance(control.validators);
    if (validators.indexOf(Validators.required) !== -1) {
      return new FormArray(chkControls, minSelectedCheckboxes(1));
    }
    return new FormArray(chkControls);
  }

  /**
   * Marks all controls in a form group as touched
   * @param formGroup - The form group to touch
   */
  public markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
