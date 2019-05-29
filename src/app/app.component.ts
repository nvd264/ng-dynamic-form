import { environment } from './../environments/environment';
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

  pageOfPosts = 1;

  @ViewChild(DynamicFormComponent) dynamicForm: DynamicFormComponent;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.questions = this.getQuestions();
    this.cloneQuestions = this.getQuestions();

    // this.getPosts().subscribe(posts => {
    //   this.dynamicForm.setDropdownOptions('posts', posts);
    // });
  }

  ngAfterViewInit() {
    // this.dynamicForm.updateFormData({
    //   firstName: 'Updated'
    // })
  }

  getQuestions() {
    const questions: FormControlBase<any>[] = [
      new DropdownControl({
        key: 'posts',
        label: 'Posts',
        options: this.getPosts(),
        value: [],
        order: 3,
        labelValue: 'id',
        labelName: 'title',
        multiple: true,
        onSearch: (searchText) => {
          this.pageOfPosts = 1;
          return this.getPosts(this.pageOfPosts, searchText);
        },
        loadMore: (searchText) => {
          this.pageOfPosts += 1;
          console.log('this.pageOfPosts', this.pageOfPosts);
          return this.getPosts(this.pageOfPosts, searchText);
        }
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
        key: 'lastName',
        label: 'Last name',
        value: '',
        validators: [
          {
            validate: ErrorTypes.REQUIRED,
            message: 'Last name is required'
          }
        ],
        order: 2,
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
            message: 'Password is required'
          }
        ],
        order: 2,
        type: 'password'
      }),
    ];

    return questions.sort((a, b) => a.order - b.order);
  }

  /**
   * Print json data from form
   * @param data
   */
  getFormResponse(data: any) {
    this.response = data;
  }

  // update form data
  updateFormData() {
    this.dynamicForm.updateFormData({
      firstName: 'Shadow',
      lastName: 'Fiend',
      posts: [1, 2, 100] // value don't exist in options list still availale in form data
    });
  }

  /**
   * Get fake post from db.json use json-server
   * @param page
   */
  getPosts(page = 1, searchText = '') {
    return from(ajax(environment.FAKE_API + `/posts?_page=${page}&title_like=${searchText}`).pipe(
      map(res => res.response)
    ));
  }
}