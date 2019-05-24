import { FormControlBase } from './FormControlBase';
import { ControlTypes } from '../enums/control-types.enum';

export class DropdownControl extends FormControlBase<any> {
  controlType = ControlTypes.DROPDOWN;
  labelValue: string;
  labelName: string;
  options: { value: string; label: string }[] = [];
  multiple = false;
  onSearch: any;
  searchOnServer = false;
  hideSearchBox = false;

  constructor(options = {}) {
    super(options);
    this.options = options['options'] || [];
    this.labelValue = options['labelValue'] || '';
    this.labelName = options['labelName'] || '';
    this.multiple = !!options['multiple'];
    this.hideSearchBox = !!options['hideSearchBox'];

    if(this.multiple && !Array.isArray(this.value)) {
      // convert value to array for multi select
      this.value = [this.value];
    }

    if(typeof options['onSearch'] === 'function') {
      this.onSearch =  options['onSearch'];
      this.searchOnServer = true;
    }
  }
}
