import { TelWrapperComponent } from './../custom-control/tel-wrapper/tel-wrapper.component';
import { TelComponent } from './../custom-fields/tel/tel.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DynamicFormModule } from 'dynamic-form';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    TelComponent,
    TelWrapperComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    DynamicFormModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [],
  entryComponents: [TelComponent, TelWrapperComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
