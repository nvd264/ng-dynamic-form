import { ControlTypes } from './../enums/control-types.enum';
import { FormControlBase } from './FormControlBase';

export class TextboxControl extends FormControlBase<string> {
    controlType = ControlTypes.TEXTBOX;
    type: string;

    constructor(options = {}) {
        super(options);
        // set type for text box
        // exam: text, number...
        this.type = options['type'] || '';
    }
}
