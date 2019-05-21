import { ErrorType } from './../enums/error-type.enum';
import { ValidatorFn, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { IValidator } from '../interfaces/IValidator';

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  constructor() { }

  /**
   * Map validates into instance of angular
   * @param validates
   */
  getValidatesInstance(validators: IValidator[]): ValidatorFn[] {
    const validatorsList = [];
    for(let i = 0; i < validators.length; i++) {
      const validator = validators[i];
      if(validator.validate === ErrorType.REQUIRED) {
        validatorsList.push(Validators.required);
      }

      if(validator.validate === ErrorType.MIN) {
        validatorsList.push(Validators.min(validator.data));
      }

      if(validator.validate === ErrorType.MAX) {
        validatorsList.push(Validators.max(validator.data));
      }

      if(validator.validate === ErrorType.MIN_LENGTH) {
        validatorsList.push(Validators.minLength(validator.data));
      }

      if(validator.validate === ErrorType.MAX_LENGTH) {
        validatorsList.push(Validators.maxLength(validator.data));
      }

      if(validator.validate === ErrorType.EMAIL) {
        validatorsList.push(Validators.email);
      }
    }

    return validatorsList;
  }

  /**
   * Get error message base error type
   * @param validators
   * @param errorType
   */
  getErrorMessage(validators: IValidator[], errorType: string): string {
    const validator = validators.find(v => v.validate === errorType);
    return validator ? validator.message : '';
  }

}
