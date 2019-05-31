import { FormControlBase } from './FormControlBase';
import { ControlTypes } from '../enums/control-types.enum';

export class CustomFieldControl extends FormControlBase<any> {
  controlType = ControlTypes.CUSTOM;
  component: any;

  constructor(options = {}) {
    super(options);

    if(options['component']) {
      this.component = options.component;
    }
  }
}
