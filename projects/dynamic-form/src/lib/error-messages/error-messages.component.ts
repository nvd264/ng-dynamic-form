import { ErrorTypes } from './../../enums/error-type.enum';
import { FormErrorService } from './../../services/form-error.service';
import { Component, Input } from '@angular/core';
import { IValidator } from '../../interfaces/IValidator';

@Component({
  selector: 'error-messages',
  templateUrl: './error-messages.component.html',
  styleUrls: ['./error-messages.component.scss']
})
export class ErrorMessagesComponent {
  @Input() errors: any;
  @Input() validators: IValidator[] = [];

  errorTypes = ErrorTypes;

  constructor(private formErrorService: FormErrorService) {}

  getErrorMessage(errorType: string): string {
    return this.formErrorService.getErrorMessage(this.validators, errorType);
  }

}
