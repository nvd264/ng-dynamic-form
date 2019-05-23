import { NgModule } from '@angular/core';
import { DynamicFormComponent } from './dynamic-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule, MatCheckboxModule, MatRadioModule, MatSelectModule, MatButtonModule } from '@angular/material';
import { ErrorMessagesComponent } from './error-messages/error-messages.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [DynamicFormComponent, ErrorMessagesComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    NgxMatSelectSearchModule
  ],
  exports: [DynamicFormComponent]
})
export class DynamicFormModule { }
