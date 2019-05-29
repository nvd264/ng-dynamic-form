import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tel-wrapper',
  templateUrl: './tel-wrapper.component.html',
  styleUrls: ['./tel-wrapper.component.css']
})
export class TelWrapperComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() controlKey: string;
  constructor() { }

  ngOnInit() {
  }

}
