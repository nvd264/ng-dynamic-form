import { ValidatorFn } from '@angular/forms';
import { IValidator } from '../interfaces/IValidator';

export class FormControlBase<T> {
  value: T;
  key: string;
  label: string;
  validators: IValidator[];
  order: number;
  controlType: string;

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      validators?: IValidator[];
      order?: number;
      controlType?: string;
    } = {}
  ) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.validators = options.validators || [];
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
  }
}
