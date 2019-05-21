import { FormControlBase } from './FormControlBase';

export class TextareaControl extends FormControlBase<string> {
    controlType = 'TEXTAREA';

    constructor(options = {}) {
        super(options);
    }
}
