import { FormControlBase } from './FormControlBase';
import { take } from 'rxjs/operators';
import { isObservable } from 'rxjs';

export class DropdownControl extends FormControlBase<string|number> {
  controlType = 'DROPDOWN';
  labelValue: string;
  labelName: string;
  options: { value: string; label: string }[] = [];

  constructor(options = {}) {
    super(options);
    this.options = options['options'] || [];
    this.labelValue = options['labelValue'] || '';
    this.labelName = options['labelName'] || '';

    // apply async options into dropdown
    if(isObservable(options['asyncData'])) {
      options['asyncData'].pipe(take(1)).subscribe(opts => {
        this.options = opts || this.options;
      });
    }
  }
}
