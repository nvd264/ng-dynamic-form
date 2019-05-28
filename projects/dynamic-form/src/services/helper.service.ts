import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }
  /**
   * Set scroll position into top
   */
  scrollDropdownToTop() {
    document.querySelector('.panel-searchbox').scrollTop = 0;
  }
}
