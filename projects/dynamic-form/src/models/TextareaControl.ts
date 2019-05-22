import { FormControlBase } from './FormControlBase';
import { ControlTypes } from '../enums/control-types.enum';

export class TextareaControl extends FormControlBase<string> {
    controlType = ControlTypes.TEXTAREA;

    constructor(options = {}) {
        super(options);
    }
}
