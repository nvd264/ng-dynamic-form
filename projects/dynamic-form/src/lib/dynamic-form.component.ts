import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CheckboxControl } from '../models/CheckboxControl';
import { ControlTypes } from '../enums/control-types.enum';
import {
  debounceTime,
  distinctUntilKeyChanged,
  exhaustMap,
  map,
  switchMap,
  takeUntil,
  finalize
} from 'rxjs/operators';
import { DropdownControl } from './../models/DropdownControl';
import { FormGroup } from '@angular/forms';
import { FormControlBase } from './../models/FormControlBase';
import { FormControlService } from './../services/form-control.service';
import { HelperService } from '../services/helper.service';
import { IDynamicOptions } from '../interfaces/IDynamicOptions';
import { IFormAction } from '../interfaces/IFormAction';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {
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

  constructor(
    private formControlService: FormControlService,
    private helperService: HelperService) {
  }

  ngOnInit() {
    this.originControls = JSON.parse(JSON.stringify(this.controls));
    this.form = this.formControlService.toFormGroup(this.controls);

    this.watchFilterDropdownOptions();
    this.watchLoadMoreDropdownOptions();
  }

  ngAfterViewInit() {
    // loop through and add scroll event listener for each dropdown
    this.dynamicDropdown.forEach(dropdown => {
      dropdown.openedChange.pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((isOpen) => {
        if (isOpen) {
          const select: HTMLElement = dropdown._elementRef.nativeElement;
          const panel: HTMLElement = dropdown.panel.nativeElement;
          const controlKey = select.getAttribute('data-key');
          const control = <DropdownControl>this.getControl(controlKey);
          if (control && control.supportLoadMore) {
            panel.addEventListener(
              'scroll',
              event => this.loadMoreOptionsOnScroll(
                event, control
              ));
          }
        } else {
          this.filterControl = null;
          this.loadMoreControl = null;
        }
      })
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Get form controls
   */
  get formControls() {
    return this.form.controls;
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
    if ((scrollTop + clientHeight) >= scrollHeight && control.supportLoadMore) {
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
   * Reset form
   * @param e
   */
  resetForm(e) {
    e.preventDefault();
    for (let i = 0; i < this.controls.length; i++) {
      if (this.controls[i] instanceof DropdownControl) {
        // override only options of dropdown
        // avoid error when function lost connect with parent
        (<DropdownControl>this.controls[i]).options = (<DropdownControl>this.originControls[i]).options;
      }
    }
    const formData = this.formControlService.getControlsData(this.originControls);
    this.updateFormData(formData);
  }

  /**
   * Filter options
   * @param searchText
   * @param control
   */
  onFilterOptions(searchText: string, control: DropdownControl) {
    if (control.searchOnServer) {
      this.filterOptions$.next({
        control,
        searchText
      });
    } else {
      control.options.map(opt => {
        // just set attribute hidden for selectop
        // prevent lost data
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
      distinctUntilKeyChanged('searchText'),
      map(value => {
        this.filterControl = value.control;
        this.filterControl.loading = true;
        this.helperService.scrollDropdownToTop();
        return value;
      }),
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
        this.setDropdownOptions(key, [...selectedOptions, ...newOptions]);
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
        const dropdownControl = <DropdownControl>this.getControl(this.loadMoreControl.key);
        const { labelValue } = dropdownControl;
        if (Array.isArray(options) && options.length) {
          // filter options
          const filteredOptions = options.filter(opt => {
            if (dropdownControl.options.find(o => o[labelValue] === opt[labelValue])) {
              return false;
            }
            return true;
          });
          dropdownControl.options = [...dropdownControl.options, ...filteredOptions];
        }
        this.loadMoreControl.loading = false;
      });
  }

  /**
   * Set dropdown options
   * @param controlKey
   * @param options
   */
  setDropdownOptions(controlKey: string, options: any[]) {
    const control = <DropdownControl>this.getControl(controlKey, ControlTypes.DROPDOWN);
    if (control) {
      control.options = options;

      // reset selected data from form
      const newSelectedOptions = this.formControlService
        .resetSelectedOptionsFromFormData(
          this.form.value,
          control,
          this.controls
        );
      this.updateFormData({
        [controlKey]: newSelectedOptions
      })
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
