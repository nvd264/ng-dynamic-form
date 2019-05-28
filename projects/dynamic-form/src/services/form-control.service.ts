import { FormErrorService } from './form-error.service';
import { FormControlBase } from './../models/FormControlBase';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { minSelectedCheckboxes } from '../validators/min-checkbox.directive';
import { ErrorTypes } from '../enums/error-types.enum';
import { DropdownControl } from '../models/DropdownControl';
import { CheckboxControl } from '../models/CheckboxControl';
import { ControlTypes } from '../enums/control-types.enum';

@Injectable({
  providedIn: 'root'
})
export class FormControlService {
  constructor(private formErrorService: FormErrorService) { }

  /**
   * Convert controls into form group
   * @params controls
   * @returns form group instance
   */
  toFormGroup(controls: FormControlBase<any>[]) {
    const group: any = {};

    controls.forEach(c => {
      if (c.controlType === ControlTypes.CHECKBOX) {
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
    const validateRequired = this.formErrorService.getValidateByErrorType(control.validators, ErrorTypes.REQUIRED);
    if (validateRequired) {
      // set numbers of checked box is required
      return new FormArray(chkControls, minSelectedCheckboxes(+validateRequired.data || 1));
    }
    return new FormArray(chkControls);
  }

  /**
   * Marks all controls in a form group as touched
   * @param formGroup - The form group to touch
   */
  markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Get controls data for form
   * @param controls FormControlBase<any>[]
   */
  getControlsData(controls: FormControlBase<any>[]) {
    const result = {};
    controls.forEach(c => {
      result[c.key] = c.value;
    });

    return result;
  }

  /**
   * Get selected checkboxes data
   * @param formData
   */
  getSelectedCheckboxesData(formData: any, controls: FormControlBase<any>[]) {
    let checkboxControls = controls.filter(c => c.controlType === ControlTypes.CHECKBOX);
    if (checkboxControls.length) {
      for (let key in formData) {
        const control = <DropdownControl>checkboxControls.find(c => c.key === key);
        if (!control) {
          continue;
        }

        const options = control.options || [];

        if (formData[key].length !== options.length) {
          throw Error(`Checkboxes and options doesn't equal.`);
        }
        const checkboxesData = [];
        for (let i = 0; i < formData[key].length; i++) {
          if (formData[key][i] === true) {
            checkboxesData.push(options[i][control.labelValue]);
          }
        }

        formData[key] = checkboxesData;
      }
    }
    return formData;
  }

  /**
   * Convert checkboxes to form data
   * @param checkedValues
   * @param control
   */
  convertCheckboxesToFormData(checkedValues: Array<string | number>, control: CheckboxControl) {
    return control.options.map(
      checkbox => {
        return !!(checkedValues.indexOf(checkbox[control['labelValue']]) > -1);
      }
    );
  }

  /**
   * Reset Selected Options From Form Data
   * @param control
   */
  resetSelectedOptionsFromFormData(formData: Object, control: DropdownControl, controls: FormControlBase<any>[]) {
    formData = this.getSelectedCheckboxesData(formData, controls);
    const selectedOptions = formData[control.key];

    const newSelectedOptions = [];
    control.options.map(opt => {
      if (selectedOptions.indexOf(opt[control.labelValue]) > -1) {
        // option exist on new list
        newSelectedOptions.push(opt[control.labelValue]);
      }
    });
    return newSelectedOptions;
  }
}
