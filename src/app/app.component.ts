import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  FormControlBase,
  DropdownControl,
  TextboxControl,
  TextareaControl,
  CheckboxControl,
  RadioGroupControl,
  IValidator,
  ErrorTypes,
  IAction,
  IFormAction,
  DynamicFormComponent
} from 'dynamic-form';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = 'ng-dynamic-form';
  questions: FormControlBase<any>[] = [];

  actions: IFormAction = {
    submit: {
      label: 'Save',
      color: 'primary'
    },
    reset: {
      label: 'Reset data',
      color: ''
    }
  }

  response: any;

  data: any;

  @ViewChild(DynamicFormComponent) dynamicForm: DynamicFormComponent;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.questions = this.getQuestions();
  }

  ngAfterViewInit() {
    // this.dynamicForm.updateFormData({
    //   firstName: 'Updated'
    // })
  }

  getQuestions() {
    const questions: FormControlBase<any>[] = [
      new DropdownControl({
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          { id: 1, name: 'Solid Name', key: 'solid', value: 'Solid' },
          { id: 2, name: 'Great Name', key: 'great', value: 'Great' },
          { id: 3, name: 'Good Name', key: 'good', value: 'Good' },
          { id: 4, name: 'Unproven Name', key: 'unproven', value: 'Unproven' }
        ],
        value: '',
        order: 3,
        labelValue: 'key',
        labelName: 'name',
        asyncData: this.getAsyncData()
      }),

      new TextboxControl({
        key: 'firstName',
        label: 'First name',
        value: '',
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'First name is required'
          }
        ],
        order: 1,
      }),

      new TextboxControl({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        order: 2,
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'Email is required'
          },
          {
            validate: ErrorTypes.EMAIL,
            message: 'Email not valid'
          }
        ],
      }),

      new TextareaControl({
        key: 'description',
        label: 'Description',
        order: 4,
        value: '',
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'Description is required',
          },
          {
            validate: ErrorTypes.MAX_LENGTH,
            message: 'Description must less than 10',
            data: 10
          },
          {
            validate: ErrorTypes.MIN_LENGTH,
            message: 'Description must greater than 2',
            data: 2
          }
        ]
      }),

      new CheckboxControl({
        key: 'englishLevel',
        label: 'English Level',
        order: 5,
        value: [],
        options: [
          { id: 1, name: 'Fresher' },
          { id: 2, name: 'Junior' },
          { id: 3, name: 'Senior' },
          { id: 4, name: 'Master' },
        ],
        labelValue: 'id',
        labelName: 'name',
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'Checkbox required. (2)',
            data: 2
          }
        ]
      }),

      new RadioGroupControl({
        key: 'sex',
        label: 'Sex',
        order: 6,
        value: '',
        options: [
          { id: 1, text: 'Radio 1' },
          { id: 2, text: 'Radio 2' },
          { id: 3, text: 'Radio 3' },
        ],
        labelValue: 'id',
        labelName: 'text',
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'Sex is required.'
          }
        ]
      }),

      new TextboxControl({
        key: 'password',
        label: 'Password',
        value: '',
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'First name is required'
          }
        ],
        order: 1,
        type: 'password'
      }),
    ];

    return questions.sort((a, b) => a.order - b.order);
  }

  getAsyncData(): Observable<any[]> {
    return of([
      { id: 5, name: 'Test async 5', key: 'test-5', value: 'Test 5' },
      { id: 6, name: 'Test async 6', key: 'test-6', value: 'Test 6' },
    ]).pipe(delay(10000));
  }

  getFormResponse(data: any) {
    this.response = data;
  }

  getSampleAsyncData() {
    setTimeout(() => {
      this.dynamicForm.updateFormData({
        firstName: 'Sample First name',
        emailAddress: 'sample@gmail'
      });
    }, 3000);

    // this.data = {
    //   firstName: 'Phong',
    //   emailAddress: 'phong@gmail'
    // };
  }
}