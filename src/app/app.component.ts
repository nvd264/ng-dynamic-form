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
  DynamicFormComponent,
  HelperService
} from 'dynamic-form';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of, from } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = 'ng-dynamic-form';
  questions: FormControlBase<any>[] = [];
  cloneQuestions: FormControlBase<any>[] = [];

  actions: IFormAction = {
    submit: {
      label: 'Save',
      color: 'primary'
    },
    reset: {
      label: 'Reset',
      color: ''
    }
  }

  response: any;

  data: any;

  braveOptions = [
    { id: 1, title: 'Solid Name', key: 'solid', value: 'Solid' },
    { id: 2, title: 'Great Name', key: 'great', value: 'Great' },
    { id: 3, title: 'Good Name', key: 'good', value: 'Good' },
    { id: 4, title: 'Unproven Name', key: 'unproven', value: 'Unproven' }
  ];

  @ViewChild(DynamicFormComponent) dynamicForm: DynamicFormComponent;

  constructor(private fb: FormBuilder, private helperService: HelperService) {
  }

  ngOnInit() {
    this.questions = this.getQuestions();
    this.cloneQuestions = this.getQuestions();
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
        options: this.braveOptions,
        value: [],
        order: 3,
        labelValue: 'id',
        labelName: 'title',
        multiple: true,
        onSearch: (searchText) => {
          // reset paged into 1
          console.log('searchText', searchText);
          return this.randomOptions();
        },
        loadMore: (searchText) => {
          console.log('load more...');
          console.log('search text from outside', searchText);
          return from(this.loadMoreOptions());
        },
        hideSearchBox: false
      }),

      new DropdownControl({
        key: 'brave-2',
        label: 'Bravery Rating 2',
        options: [
          { id: 1, name: 'Solid Name 2', key: 'solid', value: 'Solid' },
          { id: 2, name: 'Great Name 2', key: 'great', value: 'Great' },
          { id: 3, name: 'Good Name 2', key: 'good', value: 'Good' },
          { id: 4, name: 'Unproven Name 2', key: 'unproven', value: 'Unproven' }
        ],
        value: [],
        order: 3,
        labelValue: 'key',
        labelName: 'name',
        multiple: false,
        hideSearchBox: true
      }),

      new TextboxControl({
        key: 'firstName',
        label: 'First name',
        value: 'default first name',
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
        value: 'default.email@mail.com'
      }),

      new TextareaControl({
        key: 'description',
        label: 'Description',
        order: 4,
        value: 'default',
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
        value: [1, 4],
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
        value: 3,
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
        value: '123',
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
    const fakeData = [];
    for (let i = 0; i < 10; i++) {
      fakeData.push({ id: i, name: `Test async ${i}`, key: `test-${i}`, value: `Test ${i}` });
    }
    return of(fakeData).pipe(delay(5000));
  }

  getFormResponse(data: any) {
    this.response = data;
  }

  getSampleAsyncData() {
    setTimeout(() => {
      this.dynamicForm.updateFormData({
        firstName: 'Sample First name',
        emailAddress: 'sample@gmail',
        englishLevel: [4]
      });
    }, 3000);
  }

  directChangeOptionsFromControl() {
    const fakeData = [];
    for (let i = 0; i < 10; i++) {
      fakeData.push({ id: i, name: `Test async ${i}`, key: `test-${i}`, value: `Test ${i}` });
    }
    setTimeout(() => {
      // this.questions[0]['options'] = fakeData;
      // console.log(this.questions);
      const dropdown = <DropdownControl>this.questions.find(q => q.key === 'brave');
      if (dropdown) {
        dropdown.options = fakeData;
      }
    }, 2000);
  }

  updateOptionsByService() {
    const fakeData = [];
    for (let i = 0; i < 10; i++) {
      fakeData.push({ id: i, name: `Test async ${i}`, key: `test-${i}`, value: `Test ${i}` });
    }
    fakeData.push({ id: 2, name: 'Great Name', key: 'great', value: 'Great' });
    fakeData.push({ id: 3, name: 'Good Name', key: 'good', value: 'Good' });
    this.helperService.updateDropdownOptions('brave', fakeData);
  }

  setFormDataFromService() {
    const data = {
      firstName: 'Sample First name from service',
      emailAddress: 'sample-service@gmail',
      englishLevel: [4, 2]
    };

    this.helperService.setFormData(data);
  }

  randomOptions() {
    return ajax('https://jsonplaceholder.typicode.com/posts').pipe(
      map(res => res.response)
    );
  }

  loadMoreOptions() {
    return new Promise(function(res, rej) {
      setTimeout(function() {
        res([
          {
            id: 9000,
            title: 'More 9000'
          },
          {
            id: 9001,
            title: 'More 9001'
          },
          {
            id: 9002,
            title: 'More 9002'
          }
        ])
      }, 2000);
    });
  }
}