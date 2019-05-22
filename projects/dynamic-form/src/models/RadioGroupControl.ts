import { FormControlBase } from './FormControlBase';
import { ControlTypes } from '../enums/control-types.enum';

export class RadioGroupControl extends FormControlBase<string | number> {
  controlType = ControlTypes.RADIO;
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
