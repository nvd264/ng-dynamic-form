import { FormControlBase } from './FormControlBase';
import { ControlTypes } from '../enums/control-types.enum';
import { tap } from 'rxjs/operators';
import { isObservable } from 'rxjs';

export class DropdownControl extends FormControlBase<any> {
  controlType = ControlTypes.DROPDOWN;
  labelValue: string;
  labelName: string;
  options: { value: string; label: string }[] = [];
  multiple = false;
  onSearch: any;
  loadMore: any;
  hideSearchBox = false;
  searchText = '';
  loading = false;
  searchOnServer = false;
  supportLoadMore = false;

  constructor(options = {}) {
    super(options);

    this.labelValue = options['labelValue'] || '';
    this.labelName = options['labelName'] || '';
    this.multiple = !!options['multiple'];
    this.searchText = options['searchText'] || '';
    this.hideSearchBox = !!options['hideSearchBox'];

    if(this.multiple && !Array.isArray(this.value)) {
      // convert value to array for multi select
      this.value = [this.value];
    }

    if(typeof options['onSearch'] === 'function') {
      this.onSearch =  options['onSearch'];
      this.searchOnServer = true;
    }

    if(typeof options['loadMore'] === 'function') {
      this.loadMore =  options['loadMore'];
      this.supportLoadMore = true;
    }

    // set options base type
    if(isObservable(options['options'])) {
      options['options'].pipe(
        tap(() => this.loading = true)
      ).subscribe(options => {
        this.options = options;
        this.loading = false;
      });
    } else {
      this.options = options['options'] || [];
    }
  }
}
