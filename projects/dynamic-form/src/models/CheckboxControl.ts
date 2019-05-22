import { FormControlBase } from './FormControlBase';
import { ControlTypes } from '../enums/control-types.enum';

export class CheckboxControl extends FormControlBase<boolean[]> {
  controlType = ControlTypes.CHECKBOX;
  labelValue: string;
  labelName: string;
  options: { value: string; label: string }[] = [];

  constructor(options = {}) {
    super(options);
    this.labelValue = options['labelValue'] || '';
    this.labelName = options['labelName'] || '';
    this.options = options['options'] || [];
  }
}
