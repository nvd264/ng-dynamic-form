import { NgModule } from '@angular/core';
import { DynamicFormComponent } from './dynamic-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule, MatCheckboxModule, MatRadioModule, MatSelectModule, MatButtonModule } from '@angular/material';
import { ErrorMessagesComponent } from './error-messages/error-messages.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DynamicFieldDirective } from '../directives/dynamic-field.directive';
import { CustomFieldComponent } from './custom-field/custom-field.component';

@NgModule({
  declarations: [
    DynamicFormComponent,
    ErrorMessagesComponent,
    DynamicFieldDirective,
    CustomFieldComponent],
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
    MatProgressSpinnerModule
  ],
  exports: [DynamicFormComponent]
})
export class DynamicFormModule { }
