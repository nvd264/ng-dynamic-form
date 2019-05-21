import { FormControlBase } from './FormControlBase';

export class TextboxControl extends FormControlBase<string> {
    controlType = 'TEXT';
    type: string;

    constructor(options = {}) {
        super(options);
        // set type for text box
        // exam: text, number...
        this.type = options['type'] || '';
    }
}
