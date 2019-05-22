import { IValidator } from '../interfaces/IValidator';
import { ErrorTypes } from '../enums/error-type.enum';

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

  get isRequired() {
    return this.validators.findIndex(v => v.validate === ErrorTypes.REQUIRED) > -1;
  }
}
