import { DEFAULT_IDENTITY } from './../const';
import { DropdownControl } from './../models/DropdownControl';
import { FormControlService } from './../services/form-control.service';
import { FormControlBase } from './../models/FormControlBase';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ViewChildren, QueryList, OnChanges, SimpleChanges } from '@angular/core';
import { IFormAction } from '../interfaces/IFormAction';
import { ControlTypes } from '../enums/control-types.enum';
import { CheckboxControl } from '../models/CheckboxControl';
import { HelperService } from '../services/helper.service';
import { filter, takeUntil, debounceTime, distinctUntilKeyChanged, map, switchMap, exhaustMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { IDynamicOptions } from '../interfaces/IDynamicOptions';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {
  // unique form for service when update data
  @Input() identity = DEFAULT_IDENTITY;
  @Input() controls: FormControlBase<any>[] = [];
  @Input() actions: IFormAction;
  @Output() submit = new EventEmitter<any>();
  @ViewChildren('dynamicDropdown') dynamicDropdown !: QueryList<MatSelect>;

  unsubscribe$ = new Subject<any>();
  form: FormGroup;
  controlTypes = ControlTypes;
  originControls: FormControlBase<any>[];
  filterOptions$ = new Subject<IDynamicOptions>();
  filterControl: DropdownControl;
  loadMoreOptions$ = new Subject<DropdownControl>();
  loadMoreControl: DropdownControl;
  searchText = new FormControl('');

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

  /**
   * Get form controls
   */
  get formControls() {
    return this.form.controls;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.originControls = JSON.parse(JSON.stringify(this.controls));
    this.form = this.formControlService.toFormGroup(this.controls);

    this.watchFilterDropdownOptions();
    this.watchLoadMoreDropdownOptions();
  }

  ngAfterViewInit() {
    this.dynamicDropdown.forEach(dropdown => {
      dropdown.openedChange.pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((isOpen) => {
        if (isOpen) {
          const select: HTMLElement = dropdown._elementRef.nativeElement;
          const panel: HTMLElement = dropdown.panel.nativeElement;
          const controlKey = select.getAttribute('data-key');
          const control = this.getControl(controlKey);
          if (control) {
            panel.addEventListener(
              'scroll',
              event => this.loadMoreOptionsOnScroll(
                event, <DropdownControl>control
              ));
          }
        } else {
          this.filterControl = null;
          this.loadMoreControl = null;
        }
      })
    });
  }

  /**
   * Get control by key
   * @param key
   * @param type ControlTypes
   */
  getControl(key: string, type = null) {
    return this.controls.find(c => {
      if (type) {
        return c.key === key && c.controlType === type;
      }
      return c.key === key;
    });
  }

  /**
   * Load more when scrolled to bottom
   * @param event
   * @param control
   */
  loadMoreOptionsOnScroll(event, control: DropdownControl) {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if ((scrollTop + clientHeight + 50) >= scrollHeight) {
      this.loadMoreOptions$.next(control);
    }
  }

  /**
   * Update form data
   * @param data
   */
  updateFormData(data: Object) {
    Object.keys(data).forEach(controlKey => {
      const checkboxControl = this.getControl(controlKey, ControlTypes.CHECKBOX);
      let value;
      if (checkboxControl) {
        value = this.formControlService
          .convertCheckboxesToFormData(
            data[controlKey], <CheckboxControl>checkboxControl
          );
      } else {
        value = data[controlKey];
      }
      if (this.form.get(controlKey)) {
        this.form.get(controlKey).setValue(value);
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
  onFilterOptions(searchText: string, control: DropdownControl) {
    console.log('searchText', searchText);
    console.log('searchText control', control);
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
   * Watch filter dropdown options
   */
  watchFilterDropdownOptions() {
    this.filterOptions$.pipe(
      debounceTime(400),
      map(value => {
        this.filterControl = value.control;
        this.filterControl.loading = true;
        return value;
      }),
      distinctUntilKeyChanged('searchText'),
      switchMap(filter => filter.control.onSearch(filter.searchText)),
      takeUntil(this.unsubscribe$)
    ).subscribe(options => {
      if (Array.isArray(options) && this.filterControl) {
        const { key, labelValue } = this.filterControl;
        let formData = { ...this.form.value };
        formData = this.formControlService.getSelectedCheckboxesData(formData, this.controls);

        const selectedOptionsValue = formData[key];
        const selectedOptions = this.filterControl.options.filter(
          opt => selectedOptionsValue.indexOf(opt[labelValue]) > -1
        );

        // remove duplicated item on selected options
        const newOptions = options.filter(opt => {
          const optionValue = opt[labelValue];
          if (selectedOptions.find(s =>
            (<DropdownControl>s)[labelValue] === optionValue)
          ) {
            return false;
          }
          return true;
        });

        // make selected element on top of dropdown
        this.helperService.updateDropdownOptions(
          key,
          [...selectedOptions, ...newOptions]
        );
        this.filterControl.loading = false;
      }
    });
  }

  /**
   * Watch load more dropdown option
   */
  watchLoadMoreDropdownOptions() {
    this.loadMoreOptions$
      .pipe(
        debounceTime(400),
        map(control => {
          this.loadMoreControl = control;
          this.loadMoreControl.loading = true;
          return control;
        }),
        exhaustMap(control => control.loadMore(control.searchText)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(options => {
        if (Array.isArray(options)) {
          options.forEach(opt => {
            this.loadMoreControl.options.push(opt);
          });
          this.controls.map(c => {
            if (c.key === this.loadMoreControl.key) {
              c['options'] = [...c['options'], ...options];
            }
            return c;
          });
        }
        this.loadMoreControl.loading = false;
      });
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
