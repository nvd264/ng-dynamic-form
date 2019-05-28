import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IUpdateOptions } from '../interfaces/IUpdateOptions';
import { ISetFormData } from '../interfaces/ISetFormData';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  updateDropdownOptionsSource = new Subject<IUpdateOptions>();
  updateDrowdownOptions$ = this.updateDropdownOptionsSource.asObservable();

  setFormDataSource = new Subject<ISetFormData>();
  setFormData$ = this.setFormDataSource.asObservable();

  constructor() { }

  /**
   * Update dropdown options
   * @param controlKey
   * @param options
   */
  updateDropdownOptions(controlKey: string, options = [], identity = null) {
    this.updateDropdownOptionsSource.next({
      controlKey,
      options,
      identity
    })
  }

  /**
   * Set form data
   * @param Object
   */
  setFormData(data: Object, identity = null) {
    this.setFormDataSource.next({
      data,
      identity
    });
  }
}
