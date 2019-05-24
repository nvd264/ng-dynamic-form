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
import { filter, takeUntil, take, debounceTime, distinctUntilChanged, distinctUntilKeyChanged, map, mergeMap, switchMap, finalize } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { IFilterOptions } from '../interfaces/IFilterOptions';

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
  controlTypes = ControlTypes;
  originControls: FormControlBase<any>[];
  filterOptions$ = new Subject<IFilterOptions>();
  filterControl: DropdownControl;


  constructor(private formControlService: FormControlService, private helperService: HelperService) {
    helperService.updateDrowdownOptions$.pipe(
      // make sure update correct form on per page
      filter(value => this.identifyFormInstance(value.identity)),
      takeUntil(this.unsubscribe$)
    ).subscribe(optionsData => {
      this.controls.map(c => {
        if (c.key === optionsData.controlKey) {
          (<DropdownControl>c).options = optionsData.options;
          // reset selected data from form
          const newSelectedOptions = this.resetSelectedOptionsFromFormData(<DropdownControl>c);
          this.updateFormData({
            [optionsData.controlKey]: newSelectedOptions
          })
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
    this.originControls = JSON.parse(JSON.stringify(this.controls));
    this.form = this.formControlService.toFormGroup(this.controls);

    this.filterOptions$.pipe(
      debounceTime(400),
      map(value => {
        this.filterControl = value.control;
        return value;
      }),
      distinctUntilKeyChanged('searchText'),
      switchMap(filter => filter.control.onSearch(filter.searchText)),
    ).subscribe(options => {
      if (Array.isArray(options)) {
        let formData = { ...this.form.value };
        formData = this.formControlService.getSelectedCheckboxesData(formData, this.controls);

        const selectedOptionsValue = formData[this.filterControl.key];
        const selectedOptions = this.filterControl.options.filter(
          opt => selectedOptionsValue.indexOf(opt[this.filterControl.labelValue]) > -1
        );

        const newOptions = options.filter(opt => {
          const optionValue = opt[this.filterControl.labelValue];
          if (selectedOptions.find(s =>
            (<DropdownControl>s)[this.filterControl.labelValue] === optionValue)
          ) {
            return false;
          }
          return true;
        });

        // make selected element on top of dropdown
        this.helperService.updateDropdownOptions(
          this.filterControl.key,
          [...selectedOptions, ...newOptions]
        );
        this.filterControl = null;
      }
    });
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
        this.form.get(name).setValue(value);
      }
    });
  }

  /**
   * Identify form instance for update data
   * @param identity
   */
  identifyFormInstance(identity: string): boolean {
    if (this.identity === DEFAULT_IDENTITY) {
      return true;
    }
    return identity === this.identity;
  }

  /**
   * Reset form
   * @param e
   */
  resetForm(e) {
    e.preventDefault();
    for (let i = 0; i < this.controls.length; i++) {
      if (this.controls[i] instanceof DropdownControl) {
        (<DropdownControl>this.controls[i]).options = (<DropdownControl>this.originControls[i]).options;
      }
    }
    const formData = this.formControlService.getControlsData(this.originControls);
    this.updateFormData(formData);
  }

  /**
   * Reset Selected Options From Form Data
   * @param control
   */
  resetSelectedOptionsFromFormData(control: DropdownControl) {
    let formData = { ...this.form.value };
    formData = this.formControlService.getSelectedCheckboxesData(formData, this.controls);
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

  /**
   * Filter options
   * @param searchText
   * @param control
   */
  filterOptions(searchText: string, control: DropdownControl) {
    if (control.searchOnServer) {
      this.filterOptions$.next({
        control,
        searchText
      });
    } else {
      control.options.map(opt => {
        if (opt[control.labelName].toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
          opt['hidden'] = false;
        } else {
          opt['hidden'] = true;
        }
      });
    }
  }

  /**
   * Emit form data to parent
   * @param e
   */
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
}
