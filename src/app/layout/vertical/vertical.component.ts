import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { IAppState } from '../../interfaces/app-state';
import { BaseLayoutComponent } from '../base-layout/base-layout.component';
import { HttpService } from '../../services/http/http.service';
import { IOption } from '../../ui/interfaces/option';
import { Content } from '../../ui/interfaces/modal';
import { TCModalService } from '../../ui/services/modal/modal.service';
import { IPatient } from '../../interfaces/patient';
import * as PatientsActions from '../../store/actions/patients.actions';
import * as SettingsActions from '../../store/actions/app-settings.actions';
import { RocadminService } from "../../services/generalService/rocadmin.service";
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'vertical-layout',
  templateUrl: './vertical.component.html',
  styleUrls: [
    '../base-layout/base-layout.component.scss',
    './vertical.component.scss'
  ]
})
export class VerticalLayoutComponent extends BaseLayoutComponent implements OnInit {
  patientForm: FormGroup;
  gender: IOption[];
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  sub1$: Subscription;
  sub2$: Subscription;
  // pageCount;
  hospitalName: string;
  userRole: string;

  constructor(
    store: Store<IAppState>,
    fb: FormBuilder,
    httpSv: HttpService,
    router: Router,
    elRef: ElementRef,
    private modal: TCModalService,
    private rocService: RocadminService,
    public translate:TranslateService

  ) {
    super(store, fb, httpSv, router, elRef);

    this.gender = [
      {
        label: 'Male',
        value: 'male'
      },
      {
        label: 'Female',
        value: 'female'
      }
    ];
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;
  }

  ngOnInit() {
    super.ngOnInit();
    this.sub1$ = this.rocService.getUserRole().subscribe((res: any) => {
      if (res) {
        
        this.userRole = res[0]['role']['label'];
        if (this.userRole == 'carehome-manager') {
          this.getHospitalName('carehome_manager')
        }
        if (this.userRole == 'nurse') {
          this.getHospitalName('carers')
        }
      }
    }, err => console.log('Error:::', err))
    this.store.dispatch(new SettingsActions.Update({ layout: 'vertical' }));
    
    // this.rocService.recordCount.subscribe((x: any) => this.pageCount = x)
  }
  
  ngOnDestroy() {
    if (this.sub1$) this.sub1$.unsubscribe();
    if (this.sub2$) this.sub2$.unsubscribe();
  }

  getHospitalName(dataName){
    let refKeyAr = ['hospital']
    let temp = {}
    this.sub2$ = this.rocService.getPatientByIdRole(dataName, 'user.uid', refKeyAr).subscribe(async res => {
      console.log("this res", res[0])
      let hospitalNamePromise = new Promise((resolve, reject) => {
        res.forEach((dt, index) => {
          if(dt['hospital']) {
            dt['hospital'].get().then(res => {
              console.log("first consolefirst consolefirst console")
              this.hospitalName = res.data().name;
              resolve(res.data().name);
            })
          }
        });
      })
      await hospitalNamePromise;
      console.log("second consolesecond consolesecond console")
      console.log(this.hospitalName, "this hospitalName")
    })
  }

  // open modal window
  openModal<T>(body: Content<T>, header: Content<T> = null, footer: Content<T> = null, options: any = null) {
    this.initPatientForm();

    this.modal.open({
      body: body,
      header: header,
      footer: footer,
      options: options
    });
  }

  // close modal window
  closeModal() {
    this.modal.close();
    this.patientForm.reset();
    this.currentAvatar = this.defaultAvatar;
  }

  // upload new file
  onFileChanged(inputValue: any) {
    let file: File = inputValue.target.files[0];
    let reader: FileReader = new FileReader();

    reader.onloadend = () => {
      this.currentAvatar = reader.result;
    };

    reader.readAsDataURL(file);
  }

  // init form
  initPatientForm() {
    this.patientForm = this.fb.group({
      img: [],
      name: ['', Validators.required],
      number: ['', Validators.required],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  // add new patient
  addPatient(form: FormGroup) {
    if (form.valid) {
      let newPatient: IPatient = form.value;

      newPatient.img = this.currentAvatar;
      newPatient.id = '23';
      newPatient.status = 'Pending';
      newPatient.lastVisit = '';

      this.store.dispatch(new PatientsActions.Add(newPatient));
      this.closeModal();
      this.patientForm.reset();
    }
  }
}
