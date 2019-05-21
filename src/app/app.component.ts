import { Component, OnInit } from '@angular/core';
import {
  FormControlBase,
  DropdownControl,
  TextboxControl,
  TextareaControl,
  CheckboxControl,
  RadioGroupControl,
  IValidator,
  ErrorType,
  IAction,
  IFormAction
} from 'dynamic-form';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
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

  constructor(private fb: FormBuilder) { }


  ngOnInit() {
    this.questions = this.getQuestions();
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
        value: 'test-5',
        order: 3,
        labelValue: 'key',
        labelName: 'name',
        asyncData: this.getAsyncData()
      }),

      new TextboxControl({
        key: 'firstName',
        label: 'First name',
        value: 'Dong',
        validators: <IValidator[]>[
          {
            validate: ErrorType.REQUIRED,
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
        validators: <IValidator[]>[
          {
            validate: ErrorType.REQUIRED,
            message: 'Email is required'
          },
          {
            validate: ErrorType.EMAIL,
            message: 'Email not valid'
          }
        ],
      }),

      new TextareaControl({
        key: 'description',
        label: 'Description',
        order: 4,
        value: 'hola',
        validators: <IValidator[]>[
          {
            validate: ErrorType.MAX_LENGTH,
            message: 'Description must greater than 10',
            data: 10
          }
        ]
      }),

      new CheckboxControl({
        key: 'englishLevel',
        label: 'English Level',
        order: 5,
        value: [2, 4],
        options: [
          { id: 1, name: 'Fresher' },
          { id: 2, name: 'Junior' },
          { id: 3, name: 'Senior' },
          { id: 4, name: 'Master' },
        ],
        labelValue: 'id',
        labelName: 'name',
        validators: <IValidator[]>[
          {
            validate: ErrorType.REQUIRED,
            message: 'Checkbox is required.'
          }
        ]
      }),

      new RadioGroupControl({
        key: 'sex',
        label: 'Sex',
        order: 6,
        value: 2,
        options: [
          { id: 1, text: 'Radio 1' },
          { id: 2, text: 'Radio 2' },
          { id: 3, text: 'Radio 3' },
        ],
        labelValue: 'id',
        labelName: 'text'
      })
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
    console.log('data from dyn form', data);
    this.response = data;
  }
}