import { FormControlBase } from './FormControlBase';

export class CheckboxControl extends FormControlBase<boolean[]> {
  controlType = 'CHECKBOX';
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
