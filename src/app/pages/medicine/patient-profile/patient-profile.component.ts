import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BasePageComponent } from '../../base-page';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PagePatientProfileComponent extends BasePageComponent implements OnInit, OnDestroy {

  patients: any;
  assessmentData: any[] = [];
  asmtLogs: any[] = [];

  drinkLogs: any[] = [];
  eatLogs: any[] = [];
  holisticLogs: any[] = [];

  carerDropdownData: any[] = [];
  submitted = false;
  patientForm: FormGroup;
  changes: boolean;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  editId;
  status = false;
  currCHM;
  currNurse;
  loaded = false;
  disableDropdown = false;
  selectedFile: any;
  oldImgFile: any;
  downloadURL: Observable<string>;
  unsub$: Subscription[] = [];
  subNum: number = 0;

  disabledDate = (current: Date): boolean => {
    return new Date(current) > new Date();
  };

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    private route: ActivatedRoute,
    public router: Router,
    public firestore: AngularFirestore,
    private storage: AngularFireStorage

  ) {
    super(store, httpSv);

    this.pageData = {
      title: 'Patient profile page',
      breadcrumbs: [
        {
          title: 'ROC',
          route: '/default-dashboard'
        },
        {
          title: 'Patients',
          route: '/patients'
        }
      ]
    };
    // this.changes = false;
    this.defaultAvatar = 'assets/content/avatar.jpg';
    this.currentAvatar = this.defaultAvatar;
  }

  ngOnInit() {
    super.ngOnInit();
    this.getPatientLeveldata('patient_level');
    this.editId = this.route.snapshot.paramMap.get('id');
    this.unsub$[++this.subNum] = this.rocService.getUserWithRefByID('patients', this.editId, ['hospital', 'care_home', 'carer_id', 'chm_group']).subscribe((res) => {
      if (res) {
        this.patients = res;
        console.log('this.patients ', this.patients)
        let timeLine = [
          {
            "sectionData": [
              {
                "date":this.patients.created_at,
                "content": `<strong>Admitted reason</strong> - ${this.patients.reason}`,
                "iconBg": "#b7ce63"
              },
              {
                "date":'Entry point of patient',
                "content": this.patients.point_of_entry['label'],
                "iconBg": "#b7ce63"
              }
            ]
          }
        ]
        this.patients['timeLine'] = timeLine
        this.currCHM = this.patients.care_home['id']
        this.currNurse = this.patients.carer_id;
        if (this.currNurse == '') {
          this.disableDropdown = false
        }
        else {
          this.disableDropdown = true
        }

        if (this.currCHM) {
          this.getCarerDropdown()
        } else {
          this.loadedDetect();
        }
        // else {
        //   this.getCarerDropdown()
        // }
      }
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  getPatientLeveldata(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(data => {
      if (data && data.length) {
        this.assessmentData = [...data];
        this.assessmentData.map(x => {
          x.label = x.title;
          x.value = x.id
        })
      }
    })
  }

  getCarerDropdown() {
    console.log('HERE ', this.currCHM)
    this.unsub$[++this.subNum] = this.rocService.getUserByWhereRef('carers', 'care_home', this.currCHM, 'carehome_manager').subscribe((res) => {
      if (res && res.length) {
        this.carerDropdownData = res
        this.carerDropdownData.map(x => {
          x.value = x.id,
            x.label = x.fname + ' ' + x.lname
        })
        this.loadedDetect();
      }
      else {
        this.loadedDetect();
      }
    })
  }

  loadedDetect() {
    this.loaded = true;
    this.setLoaded();
    this.initPatientForm(this.patients);
    this.getAsmtLogs()
  }

  getAsmtLogs() {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhereRef('assessment-logs', 'patient_id', this.editId, 'patients').subscribe(res => {
      if (res) {
        this.asmtLogs = [...res];
        this.asmtLogs.sort((a: any, b: any) =>b.created_at - a.created_at);
        this.asmtLogs.map((x) => {
          x.asmt_time = new Date(x.created_at).toLocaleString();
          x.type = x.asmt_type.replace(/_/g, " ");
        })
        let newAry = _.groupBy(this.asmtLogs, 'asmt_type')
        this.drinkLogs = newAry['roc_drink'] ? newAry['roc_drink'] : [];
        this.eatLogs = newAry['roc_eat'] ? newAry['roc_eat'] : [];
        this.holisticLogs = newAry['roc_holistic'] ? newAry['roc_holistic'] : [];
      }
    })
  }
  // init form
  initPatientForm(data?: any) {
    this.status = data.is_active;
    this.currentAvatar = data.photo ? data.photo : this.defaultAvatar;
    this.oldImgFile = data.photo ? data.photo : '';
    this.patientForm = this.fb.group({
      photo: [''],
      fname: [data.fname ? data.fname : '', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: [data.lname ? data.lname : '', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      email: [data.email ? data.email : '', [Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      dob: [data.dob ? new Date(data.dob.seconds * 1000) : '', Validators.required],
      address: [data.address ? data.address : '', Validators.required],
      nhs_number: [data.nhs_number ? data.nhs_number : ''],
      reason: [data.reason ? data.reason : '', Validators.required],
      created_at: [data.created_at ? new Date(data.created_at).toLocaleString() : '', Validators.required],
      point_of_entry: [data.point_of_entry ? data.point_of_entry['label'] : ''],
      patient_level: [data.patient_level ? data.patient_level['value'] : '', Validators.required],
      is_active: [data.is_active ? data.is_active : false],
      care_home: [data.care_home ? data['care_home']['fname'] : ''],
      carer_id: [data.carer_id ? data['carer_id']['id'] : ''],
      hospital: [data ? data['hospital']['name'] : ''],
      phone: [data ? data.phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      nextof_kin: [data.nextof_kin ? data.nextof_kin : '', Validators.required],
      nextKin_phone: [data.nextKin_phone ? data.nextKin_phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]]

    });
    setTimeout(() => {
      this.patientForm.patchValue({
        hospital: data['hospital']['name'],
        care_home: data['care_home']['fname']
      })
    }, 700);

  }

  onFileChanged(inputValue: any) {
    let file: File = inputValue.target.files[0];
    this.selectedFile = file
    let reader: FileReader = new FileReader();
    reader.onloadend = () => {
      this.currentAvatar = reader.result;
      this.changes = true;
    };
    reader.readAsDataURL(file);
  }

  // save form data
  saveData(value) {
    this.submitted = true;
    if (this.patientForm.valid) {
      let patientLevelObj = this.assessmentData && this.assessmentData.find(x => x.value == value.patient_level)
      let newPL = {
        label: patientLevelObj.label,
        value: patientLevelObj.value
      }
      value.carer_id = this.firestore.doc(`/carers/${value.carer_id}`).ref
      let pt_birthdate = value.dob;
      const bdate = new Date(pt_birthdate);
      const timeDiff = Math.abs(Date.now() - bdate.getTime());
      let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
      var dataObj = {
        "fname": value.fname,
        "lname": value.lname,
        "photo": value.photo,
        "email": value.email,
        "reason": value.reason,
        "address": value.address,
        "dob": value.dob,
        "age": age,
        "phone": value.phone,
        "carer_id": value.carer_id,
        "nextof_kin": value.nextof_kin,
        "nextKin_phone": value.nextKin_phone,
        "patient_level": newPL,
        "is_active": value.is_active,
        "updated_at": new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      }
      if (this.selectedFile) this.imageFunction(dataObj);
      else this.updateServiceCalling(dataObj)

    }
  }

  updateServiceCalling(dataObj) {

    if (dataObj['photo'] == '') {
      dataObj['photo'] = this.oldImgFile;
    }
    let deleteUrl = this.oldImgFile;
    this.rocService.updateUser('patients', dataObj, this.editId).then((res) => {
      if (this.changes && deleteUrl) {
        this.storage.storage.refFromURL(deleteUrl).delete(); 
      }
      this.generalService.showSuccess("Data Successfully Updated!!", "")
      this.selectedFile = undefined;
      this.changes = false;
      this.router.navigate(['patients'])
    }, (err) => {
      console.log("ERR::", err)
      this.generalService.showError(err.message, "");
    })
  }

  imageFunction(value) {
    var n = Date.now();
    const filePath = `profileImages/${n}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`profileImages/${n}`, this.selectedFile);
    this.unsub$[++this.subNum] = task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.unsub$[++this.subNum] = this.downloadURL.subscribe(url => {
            if (url) {
              value['photo'] = url;
              this.updateServiceCalling(value)
            }
          });
        })
      ).subscribe(url => {
        if (url) {
        }
      })
  }
  get f() { return this.patientForm.controls; }
}
