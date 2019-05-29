import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-tel',
  templateUrl: './tel.component.html',
  styleUrls: ['./tel.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TelComponent),
      multi: true
    }
  ]
})
export class TelComponent implements ControlValueAccessor {

  onChange: any = () => {}
  onTouch: any = () => {}

  tel = '';
  phoneCode = '';
  phoneNumber = '';

  constructor() { }

  set value(val) {
    if(val && this.tel !== val) {
      this.tel = val;
      [this.phoneCode, this.phoneNumber] = val.split(' ');
      this.onChange(val);
      this.onTouch(val);
    }
  }

  onValueChange($event) {
    this.value = this.phoneCode + ' ' + this.phoneNumber;
    this.onChange(this.value);
  }

  get value() {
    return this.tel;
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any){
    this.onChange = fn;
  }

  registerOnTouched(fn: any){
    this.onTouch = fn;
  }
}
