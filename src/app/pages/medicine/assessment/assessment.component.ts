import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BasePageComponent } from '../../base-page';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TCModalService } from 'src/app/ui/services/modal/modal.service';
import { Subject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { IPatient, ICurrentUser } from 'src/app/interfaces/patient';
import { Icu } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent extends BasePageComponent implements OnInit, OnDestroy {
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;
  @ViewChild('modalTooltip', { static: true }) modalTooltip: ElementRef<any>;


  // patients: IPatient;
  submitted1: boolean = false;
  submitted2: boolean = false;
  assessmentForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  currentUser: ICurrentUser[] = [];
  editId;
  patientsData = [];
  no_assessment: any;
  colorVal:any;
  unsub$: Subscription[] = [];
  subNum: number = 0;
  // 4 assessment array:
  roc_drinkEat = [];
  roc_holistic = [];
  roc_mobility = [];

  radioArray = [];
  step1 = false;
  step2 = false;
  currentRole: any;
  collectionName: any;
  nextEnable = false;
  filterByDate = [];
  callOnSelect: any;
  drinkTypeData = [];

  bedsArray = [];
  //var from assessmt due navigation
  pid: any;
  type: any;

  newTime;
  selectedValues: any;
  isDataLoaded = new Subject();

  unsubscribePT:any
  tooltips=[];
  alertShow=false;
  ttRed;
  ttGreen;
  ttOrange;


  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public router: Router,
    public firestore: AngularFirestore,
    public modal: TCModalService


  ) {
    super(store, httpSv);

    this.pageData = {
      title: 'Patient Assessment Form',
      breadcrumbs: [
        {
          title: 'ROC',
          route: '/default-dashboard'
        },
        {
          title: 'Patient Assessment',
          route: '/assessment'
        }
      ]
    };

    this.roc_drinkEat = [
      {
        value: 'swallow',
        title: 'Swallow'
      },
      {
        value: 'assist',
        title: 'Assist'
      },
      {
        value: 'encourage',
        title: 'Encourage'
      }
    ]

    this.roc_holistic = [
      {
        value: 'hearing',
        title: 'Hearing'
      },
      {
        value: 'vision',
        title: 'Vision'
      },
      {
        value: 'speech',
        title: 'Speech'
      },
      {
        value: 'recognition',
        title: 'Recognition'
      }
    ]

    this.roc_mobility = [
      {
        value: 'get drink',
        title: 'Get Drink'
      },
      {
        value: 'sit up',
        title: 'Vision'
      },
      {
        value: 'transfer',
        title: 'Transfer'
      },
      {
        value: 'continece',
        title: 'Continece'
      }
    ]

    this.drinkTypeData = [
      { title: 'Nil by mouth', value: 'nil_by_mouth' },
      { title: 'Fluid balance chart', value: 'fluid_balance_chart' },
      { title: 'IVI', value: 'ivi' },
      { title: 'PEG', value: 'peg' }
    ]
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;

    // WON'T WORK EXCEPT DECLARED IN CONSTRUCTOR, I BELIEVE
    if (this.router.getCurrentNavigation()) {
      // alert('navigated')
      const navigationData = this.router.getCurrentNavigation().extras.state;
      console.log('NavigationData',navigationData);
      
      if (navigationData) {
        this.selectedValues = navigationData;
        this.setInitialData()
      }
    }else {
      this.router.navigate(['/patients']);
    }
  }

  async ngOnInit() {
    // alert(this.step1)
    this.step1 = true;
    // console.log('this.step1---',this.step1);
    
    // localStorage.removeItem('patientClick');
    localStorage.removeItem('secondClick');
    super.ngOnInit();
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe(async (res: ICurrentUser[]) => {
      if (res) {
        this.currentUser = res
        this.currentRole = this.currentUser[0].role['label']
        // console.log('this.currentRole', this.currentRole);
        
        if (this.currentRole == 'roc-admin') {
          await this.getUserData('roc_admin', 'loadedDetect')
        }
        else if (this.currentRole == 'carehome-manager') {
          await this.getUserData('carehome_manager', 'loadedDetect')
        }
        else if (this.currentRole == 'nurse') {
          await this.getUserData('carers', 'loadedDetect')
        }
        else {
          await this.getUserData('user_role', 'loadedDetect')
        }
      }
    });
    // console.log('this.step1',this.step1);
    await this.loadedDetect();
    // console.log('this.step1',this.step1);
    this.unsub$[++this.subNum] = await this.rocService.getUserRole().subscribe((res: ICurrentUser[]) => {
      this.currentUser = res
    })

    this.unsub$[++this.subNum] = await this.rocService.getUser('rocAdmin_settings').subscribe(res => {
      this.bedsArray = []
      if (res && res.length) {
        this.colorVal = res[0];
        this.bedsArray.push({ value: res[0].greenVal, displayText: 'Green', class: 'green' });
        this.bedsArray.push({ value: res[0].orangeVal, displayText: 'Orange', class: 'orange' });
        this.bedsArray.push({ value:res[0].redVal, displayText: 'Red', class: 'red' });
      }

    });
    this.setInitialData();
    // console.log('this.step1',this.step1);
    this.unsub$[++this.subNum] = await this.rocService.getUser('tooltips').subscribe(res =>{
      if(res && res.length) this.tooltips = res[0]
    })
    // console.log('this.step1---',this.step1);
  }

  genRoomArray(): FormArray {
    const roomsArray = new FormArray([]);
    for (let i = 0; i < this.radioArray.length; i++) {
      const roomGroup = new FormGroup({
        bedsCount: new FormControl('', Validators.required)
      });

      roomsArray.push(roomGroup);
    }
    return roomsArray;
  }

  genRoomName(): FormArray {
    const roomName = new FormArray([]);
    for (let i = 0; i < this.radioArray.length; i++) {
      const roomGroup = new FormGroup({
        roomName: new FormControl(this.radioArray[i].title)
      });

      roomName.push(roomGroup);
    }
    return roomName;
  }

  getUserData(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhere(dataName, 'user.uid', this.currentUser[0].uid).subscribe((res) => {
      if (res && res.length) {
        console.log('res',res);
        
        console.log('carer_id::',res[0].id);
        // console.log('this.step1',this.step1);
        this.unsubscribePT = this.rocService.getUserByWhereRef('patients', 'carer_id', res[0].id, 'carers').subscribe((res) => {
          if (res && res.length) {
            console.log('patient res::',res);
            this.patientsData = res;
            let arrayFilter = this.patientsData.filter((x: any) => {
              return x.is_active == true
            })
            this.patientsData = arrayFilter;
            this.patientsData.map(x => {
              x.value = x.id,
                x.label = x.fname + ' ' + x.lname
            })
            // console.log('isDataLoaded :: ', this.isDataLoaded);
            
            this.isDataLoaded.next(true);
            console.log('this.step1 f ',this.step1);
          }else {
            this.isDataLoaded.next(true);
            console.log('this.step1 f ',this.step1);
          }
        }, err => {
          console.log("err", err)
        })
      }
      this.loadedDetect();
    }, err => {
      console.log("Err", err)
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if(this.unsubscribePT) this.unsubscribePT.unsubscribe();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  loadedDetect() {
    this.setLoaded();
    this.initAssessmentForm();
  }

  onPatientSelect(event) {
    this.unsub$[++this.subNum] = this.rocService.getUserById('patient_level', event.patient_level['value']).subscribe((res: any) => {
      if (res) {
        this.no_assessment = res['no_assessment'];
        this.checkPatientAsmt(this.collectionName, this.no_assessment, this.f.selPatient.value, 'patient')
      }
    })
  }

  onTypeSelect(event) {
    if (event == 'ROC to Eat') this.collectionName = "roc_eat";
    if (event == 'ROC to Drink') this.collectionName = "roc_drink";
    if (event == 'ROC to Holistic') this.collectionName = "roc_holistic";
    if (event == 'ROC to Mobility') this.collectionName = "roc_mobility";
    this.checkPatientAsmt(this.collectionName, this.no_assessment, this.f.selPatient.value)
  }

  checkPatientAsmt(coll, num, pid, type?) {
    if (coll && num && pid) {
      this.unsub$[++this.subNum] = this.rocService.getUserByWhere(coll, 'patient_id', pid).subscribe((res) => {
        if (res) {
          let collData = [...res]
          this.filterByDate = collData && collData.filter((x) => {
            return x.created_at.split(' ')[0] == new Date().toLocaleDateString();
          })
         
          let comptObj = {}
          if (coll == 'roc_drink') comptObj = { is_completed1: true }
          if (coll == 'roc_eat') comptObj = { is_completed2: true }
          if (coll == 'roc_holistic') comptObj = { is_completed3: true }
          if (coll == 'roc_mobility') comptObj = { is_completed4: true }

          if ((this.filterByDate.length >= num) && !this.submitted2) {
            this.nextEnable = false;
            this.rocService.updateUser('patients', comptObj, pid)
            this.generalService.showInfo("Assessment is completed for the day", '');
          } else {
            this.nextEnable = true;
          }
        }
      })
    }
  }

  initAssessmentForm(data?: any) {
    this.assessmentForm = this.fb.group({
      selPatient: ['', Validators.required],
      selAssessment: ['', Validators.required]
    });
  }

  getRadioArray(selType) {
    if (selType == 'ROC to Drink') this.radioArray = this.roc_drinkEat;
    if (selType == 'ROC to Eat') this.radioArray = this.roc_drinkEat;
    if (selType == 'ROC to Holistic') this.radioArray = this.roc_holistic;
    if (selType == 'ROC to Mobility') this.radioArray = this.roc_mobility;
  }

  openModalDelete(body: any, header: any = null, footer: any = null) {
    this.modal.open({
      body: body,
      header: header,
      footer: footer
    });
  }

  onInfoClick(type,subType){
    console.log({type,subType})
    this.alertShow = !this.alertShow;
    let title = (type.split(' ')[2] + '_'+subType).toLowerCase();
    console.log('TITLE ', title)
    Object.keys(this.tooltips).map(t => {
      if(t.includes(title)) {
        if(t.includes('red')) this.ttRed = this.tooltips[t];
        if(t.includes('green')) this.ttGreen = this.tooltips[t]
        if(t.includes('orange')) this.ttOrange = this.tooltips[t]

      }
    })
    this.openModal(this.modalTooltip,null,null, { closeButton: false, overlayClose: true })
  }

  openModal(body: any, header: any = null, footer: any = null, data: any = null) {
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
      options:data
    });
  }

  // save form data
  saveData() {
    // debugger
    localStorage.setItem('secondClick','true');
    let assessType = this.assessmentForm.value.selAssessment;
    if (assessType == 'ROC to Drink') this.storeData('roc_drink')
    if (assessType == 'ROC to Eat') this.storeData('roc_eat')
    if (assessType == 'ROC to Holistic') this.storeData('roc_holistic')
    if (assessType == 'ROC to Mobility') this.storeData('roc_mobility')
  }

  storeData(coll) {
    let color;
    let formValue = this.assessmentForm.value;
    let counts = formValue.rooms;
    let rating = counts && counts.map((x) => {
      return x.bedsCount
    }).reduce((t, n) => +t + +n);
    
    let checkRed = counts && counts.filter(x => {
      if (x.bedsCount === this.colorVal.redVal) return true;
      else return false;
    })


    if (rating == (this.colorVal.greenVal * counts.length)) color = "Green";
    else if (rating > this.colorVal.orangeVal && checkRed.length == 0) color = "Orange";
    else color = "Red";

    let ratingObj = {
      score: rating,
      color: color
    }
    let typeKey = formValue.roomNo;
    let typeVal = formValue.rooms;

    let dataObj = {
      patient_id: formValue.selPatient,
      rating: ratingObj,
      created_by: this.currentUser[0],
      created_at: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    }

    for (let i = 0; i < typeKey.length; i++) {
      const key = typeKey[i].roomName;
      const val = typeVal[i].bedsCount;
      let color;
      if (val == this.colorVal.greenVal) color = 'Green';
      if (val == this.colorVal.orangeVal) color = 'Orange';
      if (val == this.colorVal.redVal) color = 'Red';
      dataObj[key] = color;
    }
    // console.log("Data obj::", dataObj)
    // return;
    let lastobj = {}
    let asmtObj: any = dataObj;
    asmtObj['patient_id'] = this.firestore.doc(`/patients/${formValue.selPatient}`).ref;
    asmtObj['asmt_type'] = coll;
    asmtObj['created_at'] = new Date().getTime();
    if (coll == 'roc_drink') {
      lastobj['drink'] = color
      lastobj['drink_time'] = new Date().getTime()
      dataObj['fluid_balance_chart'] = !!formValue.fluid_balance_chart
      dataObj['ivi'] = !!formValue.ivi
      dataObj['peg'] = !!formValue.peg
      dataObj['nil_by_mouth'] = !!formValue.nil_by_mouth
    }
    if (coll == 'roc_eat') {
      lastobj['eat'] = color
      lastobj['eat_time'] = new Date().getTime()
    }
    if (coll == 'roc_holistic') {
      lastobj['holistic'] = color
      lastobj['holistic_time'] = new Date().getTime()
    }
    lastobj['last_assessmentTime'] = new Date().getTime()
    // console.log("data obj::",dataObj)
    // return;
    console.log('DATA ', coll, ' ', dataObj);
    // return;
    this.rocService.addRecord(coll, dataObj).then((res) => {
      this.rocService.addRecord('assessment-logs', dataObj); // for assessment log of each patient
      this.rocService.updateUser('patients', lastobj, formValue.selPatient); //update last assessment color
      this.rocService.updateUser('patients', { "both_time.last_assessment": new Date().getTime() }, formValue.selPatient) // update last assessment time
      this.submitted2 = false;
      this.assessmentForm.reset();
      this.modal.close();
      this.nextEnable = false;
      this.BackButton();
      this.submitted1 = false;
      this.collectionName = undefined;
      this.no_assessment = undefined;
      this.generalService.showSuccess("Data Successfully Added!!", "");
        
      this.router.navigate(['/assessment-data']);
      
      this.rocService.setPriorityState(true)
    }, err => {
      console.log("Err", err)
    })
  }

  NextButton() {
    this.submitted1 = true;
    if (this.assessmentForm.valid) {
      // alert('valid')
      let selType = this.f['selAssessment'].value;
      if (selType === 'ROC to Drink') {
        this.assessmentForm.addControl('nil_by_mouth', new FormControl(''));
        this.assessmentForm.addControl('fluid_balance_chart', new FormControl(''));
        this.assessmentForm.addControl('ivi', new FormControl(''));
        this.assessmentForm.addControl('peg', new FormControl(''))
      }
      this.getRadioArray(selType);
      this.assessmentForm.addControl('rooms', this.genRoomArray());
      this.assessmentForm.addControl('roomNo', this.genRoomName()),
        this.step2 = true;
      this.step1 = false;
    }
    else {
      return
    }
  }

  BackButton() {
    this.step1 = true;
    this.step2 = false;
    this.submitted2 = false;
    this.assessmentForm.removeControl('rooms');
    this.assessmentForm.removeControl('roomNo');
  }

  finalClick() {
  
    this.submitted2 = true;
    if (this.assessmentForm.valid) {
      // console.log('this.assessmentForm ', this.assessmentForm)
      this.openModalDelete("You want to Submit this assessment?", "Are you sure?", this.modalDelete)
    }
    else {
      return
    }
  }

  get f() { return this.assessmentForm.controls; }

  setInitialData() {
    // alert('here')
    this.unsub$[++this.subNum] = this.isDataLoaded.subscribe(isLoad => {
      if (isLoad) {
        console.log('isLoad :: ', isLoad);
        
        this.assessmentForm.patchValue({
          selPatient: this.selectedValues.patient_id,
          selAssessment: `ROC to ${this.selectedValues.roc_type}`
        })
        this.NextButton();
      }
    })
  }
}
