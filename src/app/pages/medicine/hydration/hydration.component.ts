import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as PageActions from '../../../store/actions/page.actions';
import { IPageData } from '../../../interfaces/page-data';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TCModalService } from 'src/app/ui/services/modal/modal.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, Subscription } from 'rxjs';
import { BasePageComponent } from '../../base-page/base-page.component';
import { ICurrentUser, IPatient } from 'src/app/interfaces/patient';
import { IDueData, IColorVal, IDrinkEat, IBeds, ISettingdata } from 'src/app/interfaces/dashboard';

@Component({
  selector: 'app-hydration',
  templateUrl: './hydration.component.html',
  styleUrls: ['./hydration.component.scss']
})
export class HydrationComponent extends BasePageComponent implements OnInit, OnDestroy {

  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;
  @ViewChild('modalTooltip', { static: true }) modalTooltip: ElementRef<any>;
  clicked: boolean = false;
  loaded: boolean = false;
  patients: IPatient[];
  submitted1: boolean = false;
  submitted2: boolean = false; 
  assessmentForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  currentUser: ICurrentUser[];
  editId: string;
  patientsData: IDueData[] = [];
  no_assessment: any;
  colorVal: IColorVal;
  // 4 assessment array:
  roc_drinkEat: IDrinkEat[] = [];
  roc_holistic: IDrinkEat[] = [];
  roc_mobility: IDrinkEat[] = [];

  radioArray: IDrinkEat[] = [];
  step1: boolean = false;
  step2: boolean = false;
  currentRole: string;
  collectionName: string;
  nextEnable: boolean = false;
  filterByDate = [];
  callOnSelect: Subscription;
  drinkTypeData: IDrinkEat[] = [];
  isValid: boolean = true;
  bedsArray: IBeds[] = [];
  //var from assessmt due navigation
  // pid: any;
  // type: any;
  unsub$: Subscription[] = [];
  subNum: number = 0;

  // newTime;
  selectedValues: any;
  isDataLoaded = new Subject();

  tooltips: string[] = [];
  alertShow: boolean = false;
  messageError: boolean = false;
  ttRed: string;
  ttGreen: string;
  ttOrange: string;

  carers_feedback: string;
  // notes;

  // type_of_drink = [];
  type_of_drink: string;
  carerName: string;
  intake_volume: string;
  singlePat: any;
  settingData: ISettingdata;
  intakeData = [{
    name: 'FullCup',
    value: 'full'
  }, {
    name: '3/4 Cup',
    value: 'threeforth'
  }, {
    name: '1/2 Cup',
    value: 'half'
  }, {
    name: '1/4 Cup',
    value: 'oneThird'
  }, {
    name: 'Few Sips',
    value: 'few_sips'
  }, {
    name: 'None',
    value: 'none'
  }]
  // labelData: any;
  label: string;
  currentUrl: string = '';
  previousUrl: string = '';
  constructor(
    public store: Store<IAppState>,
    public httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public router: Router,
    public firestore: AngularFirestore,
    public modal: TCModalService,
    private route: ActivatedRoute,
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

  }

  ngOnInit(): void {
    localStorage.setItem('showLabel','true')
    this.step1 = true;
    this.initAssessmentForm()
    this.editId = this.route.snapshot.paramMap.get('id');
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res: ICurrentUser[]) => {
      if (res) {
        this.currentUser = res;
        console.log('this.currentUser ', this.currentUser)
        this.currentRole = this.currentUser[0].role['label']
        if (this.currentRole == 'roc-admin') {
          this.getUserData('roc_admin', 'loadedDetect')
        }
        else if (this.currentRole == 'carehome-manager') {
          this.getUserData('carehome_manager', 'loadedDetect')
        }
        else if (this.currentRole == 'nurse') {
          this.getUserData('carers', 'loadedDetect')
        }
        else if (this.currentRole == 'chm-group') {
          this.getUserData('chm_group', 'loadedDetect')
        }
        else {
          this.getUserData('user_role', 'loadedDetect')
        }
      }
    })
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res: ICurrentUser[]) => {
      this.currentUser = res
    })

    this.unsub$[++this.subNum] = this.rocService.getUser('rocAdmin_settings').subscribe(res => {
      this.bedsArray = []
      if (res && res.length) {
        this.settingData = res[0];
        console.log(this.settingData)
        this.colorVal = res[0];
        this.bedsArray.push({ value: res[0].greenVal, displayText: 'Green', class: 'green' });
        this.bedsArray.push({ value: res[0].orangeVal, displayText: 'Orange', class: 'orange' });
        this.bedsArray.push({ value: res[0].redVal, displayText: 'Red', class: 'red' });
      }
      console.log("this beds array", this.bedsArray)
    })

    this.unsub$[++this.subNum] = this.rocService.getUser('tooltips').subscribe(res => {
      if (res && res.length) this.tooltips = res[0]
    })
    this.NextButton()
  }

  getUserData(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhere(dataName, 'user.uid', this.currentUser[0].uid).subscribe((res) => {
      if (res && res.length) {
        this.carerName = res[0]['fname'] + ' ' + res[0]['lname'];
        this.unsub$[++this.subNum] = this.rocService.getUser('patients').subscribe((res) => {
          if (res && res.length) {
            this.patientsData = res;
            let index = this.patientsData.findIndex(p => p.id == this.editId)
            this.singlePat = this.patientsData[index]
            console.log(this.singlePat)
            let arrayFilter = this.patientsData.filter((x: any) => {
              return x.is_active == true
            })
            this.patientsData = arrayFilter;
            this.patientsData.map(x => {
              x.value = x.id,
                x.label = x.fname + ' ' + x.lname
            })
            console.log("this patientdata", this.patientsData)
            this.isDataLoaded.next(true);
            this.loadedDetect();
          }
        }, err => {
          console.log("err", err);
          this.loadedDetect();
        })
      }
    }, err => {
      console.log("Err", err)
      this.loadedDetect();
    })
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


  loadedDetect() {
    console.log("SETTIMELOAD======")
    this.setLoaded();
  }

  setLoaded(during: number = 0) {
    setTimeout(() => this.store.dispatch(new PageActions.Update({ loaded: true })), during);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
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
      this.unsub$[++this.subNum] = this.callOnSelect = this.rocService.getUserByWhere(coll, 'patient_id', pid).subscribe((res) => {
        if (res) {
          let collData = [...res]
          this.filterByDate = collData && collData.filter((x) => {
            return x.created_at.split(' ')[0] == new Date().toLocaleDateString();
          })

          let comptObj = {}
          if (coll == 'roc_drink') comptObj = { is_completed1: true }
          else if (coll == 'roc_eat') comptObj = { is_completed2: true }
          else if (coll == 'roc_holistic') comptObj = { is_completed3: true }
          else if (coll == 'roc_mobility') comptObj = { is_completed4: true }

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

  get f() { return this.assessmentForm.controls; }

  initAssessmentForm(data?: any) {
    this.assessmentForm = this.fb.group({
      selPatient: ['', Validators.required],
      selAssessment: ['', Validators.required],
      notes: ['']
    });
  }

  getRadioArray(selType) {
    if (selType == 'ROC to Drink') this.radioArray = this.roc_drinkEat;
    if (selType == 'ROC to Eat') this.radioArray = this.roc_drinkEat;
    if (selType == 'ROC to Holistic') this.radioArray = this.roc_holistic;
    if (selType == 'ROC to Mobility') this.radioArray = this.roc_mobility;
  }

  onPatientSelect(event) {
    this.unsub$[++this.subNum] = this.rocService.getUserById('patient_level', event.patient_level['value']).subscribe((res: any) => {
      if (res) {
        this.no_assessment = res['no_assessment'];
        this.checkPatientAsmt(this.collectionName, this.no_assessment, this.f.selPatient.value, 'patient')
      }
    })
  }


  saveData() {
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
    let lastobj = {}
    let asmtObj: any = dataObj;
    asmtObj['patient_id'] = this.firestore.doc(`/patients/${this.editId}`).ref;
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
    console.log("data obj roc_drink ::", dataObj)

    let lastIntake = 0;
    
    let pat = this.patientsData.findIndex(p => p.id == this.editId)
    console.log('464 ', this.patientsData[pat])
    let intk = this.settingData[this.intake_volume] ? this.settingData[this.intake_volume] : 0;
    if (this.patientsData[pat] && this.patientsData[pat]['intake']) {
      lastIntake = lastIntake + +this.patientsData[pat]['intake'] + +intk;
    } else {
      lastIntake = lastIntake + +intk;
    }

    lastobj['intake'] = lastIntake
    // this.rocService.addRecord('assessment-logs', dataObj).then((refs:any)=>{
    //   this.acknowledgementTopUp(); // To add acknowledgement for each patient's assessment within hydration HL
    // }); // for assessment log of each patient
    this.rocService.updateUser('patients', lastobj, this.editId); //update last assessment color
    this.rocService.updateUser('patients', { "both_time.last_assessment": new Date().getTime() }, this.editId) // update last assessment time
    this.rocService.setPriorityState(true)
    this.rocService.addRecord(coll, dataObj).then((res) => {
      this.acknowData['assessment']=dataObj;
      this.rocService.addRecord('assessment-logs', dataObj).then((refs:any)=>{
        this.acknowledgementTopUp(); // To add acknowledgement for each patient's assessment within hydration HL
      }); // for assessment log of each patient
      // this.rocService.updateUser('patients', lastobj, this.editId); //update last assessment color
      // this.rocService.updateUser('patients', { "both_time.last_assessment": new Date().getTime() }, this.editId) // update last assessment time
      this.submitted2 = false;
      this.assessmentForm.reset();
      this.modal.close();
      this.nextEnable = false;
      this.submitted1 = false;
      this.collectionName = undefined;
      this.no_assessment = undefined;
      // this.rocService.setPriorityState(true)
    }, err => {
      console.log("Err", err)
    })
  }

  setInitialData() {
    this.unsub$[++this.subNum] = this.isDataLoaded.subscribe(isLoad => {
      if (isLoad) {
        this.assessmentForm.patchValue({
          selPatient: this.selectedValues.patient_id,
          selAssessment: `ROC to ${this.selectedValues.roc_type}`
        })
        // this.NextButton();
      }
    })
  }

  NextButton() {
    let selType = 'ROC to Drink'
    this.getRadioArray(selType);
    this.assessmentForm.addControl('rooms', this.genRoomArray());
    this.assessmentForm.addControl('roomNo', this.genRoomName()),
    this.step2 = true;
    this.step1 = false;
  }

  BackButton() {
    this.router.navigateByUrl(`/user-profile/${this.editId}`)
  }
  private acknowData:any={};

  finalClick() {
    this.submitted1 = true;
    let notedValues =  this.assessmentForm.get('notes').value;
    if(this.carers_feedback === '' || this.carers_feedback === undefined){
      this.messageError = true;
      return false 
    }else{
      this.clicked = true;
      this.messageError = false;
    }
    if(!this.type_of_drink){
      this.isValid = false;
      this.clicked = false;
      return;
    }    

    if(this.carers_feedback!='A' && notedValues=='') {
      this.isValid = false;
      this.clicked = false;
      return;
    } else {
      console.log('valid')
    }
    let dataObj;
    dataObj = {
      date_time_of_record: new Date().getTime(),
      intake_volume: this.settingData[this.intake_volume] ? this.settingData[this.intake_volume] : 0,
      type_of_drink: this.type_of_drink,
      name_who_submitted: this.carerName,
      feedback: this.carers_feedback,
      notes : notedValues
    }
    
    console.log('dataObj',dataObj)
    for (const key in dataObj) {
      let element = dataObj[key];
      if (!!element) {
        console.log('key true',key)
        this.isValid = true;
      } else {
        if(key=='notes')
          this.isValid = true
        else
          this.isValid = false
      }
    }
    if (!this.isValid) return; 

    //dataObj['notes'] = '';
    dataObj['patient_id'] = this.firestore.doc(`/patients/${this.editId}`).ref;
    if(dataObj['feedback']=="Concerned"||dataObj['feedback']=="C"){
      dataObj['isAcknowledged']=false;
    }else{
      dataObj['isAcknowledged']=true;
    }
    console.log('dataObj ', dataObj)
    this.acknowData['hydration']=dataObj;
    this.rocService.addRecord('roc_point_of_care_hydration', dataObj).then(async (res) => {
      console.log('RES============', res)
      this.storeData('roc_drink');
      this.generalService.showSuccess("Data Successfully Added!!", "");
      localStorage.setItem('patientClick','true');
      localStorage.setItem('showLabel','true');
      this.router.navigate(['/patients']);
      this.submitted1 = false;
    })
  }

  volConsumed(arg) {
    this.intake_volume = arg
  }

  carerFeed(arg) {
    if(arg=='A'){

    }
    this.carers_feedback = arg
  }
  typeOfDrink(arg) {
    this.type_of_drink = arg;
  }

  onInfoClick(type, subType) {
    console.log({ type, subType })
    this.alertShow = !this.alertShow;
    let title = (type.split(' ')[2] + '_' + subType).toLowerCase();
    console.log('TITLE ', title)
    Object.keys(this.tooltips).map(t => {
      if (t.includes(title)) {
        if (t.includes('red')) this.ttRed = this.tooltips[t];
        if (t.includes('green')) this.ttGreen = this.tooltips[t]
        if (t.includes('orange')) this.ttOrange = this.tooltips[t]
      }
    })
    console.log(this.ttRed, this.ttGreen, this.ttOrange)
    this.openModal(this.modalTooltip, null, null, { closeButton: false, overlayClose: true })
  }


  openModal(body: any, header: any = null, footer: any = null, data: any = null) {
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
      options: data
    });
  }

  acknowledgementTopUp(){
    let assessment=this.acknowData['assessment'];
    let hydration=this.acknowData['hydration'];
    let assessmentData={
      Assist:assessment.Assist,
      Encourage:assessment.Encourage,
      Swallow:assessment.Swallow,
      asmt_type:assessment.asmt_type,
      rating:assessment.rating,
      assessment_time:assessment.created_at,
      assessment_by:assessment.created_by,
      isDeleted:false,
      deletedBy:'',
      acknowledgedBy:'',
      remarks:'',
      acknowledgedAt:0
    };
    let rawdata={...assessmentData,...hydration};
    console.log("🚀 ~ file: hydration.component.ts ~ line 654 ~ HydrationComponent ~ acknowledgementTopUp ~ data", rawdata)
    this.rocService.addRecord('roc_acknowledgements', rawdata).then((res) => {
      console.log("🚀 ~ file: hydration.component.ts ~ line 652 ~ HydrationComponent ~ this.rocService.addRecord ~ res", res)
    }).catch(err=>{
      console.log("🚀 ~ file: hydration.component.ts ~ line 654 ~ HydrationComponent ~ this.rocService.addRecord ~ err", err)
    });
  }
  getManager(assessment_by: any) {
    this.rocService.getUserByWhereHL('carehome_manager','user.uid',assessment_by.uid)
  }
  
}