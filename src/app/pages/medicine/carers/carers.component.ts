import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BasePageComponent } from '../../base-page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { TCModalService } from '../../../ui/services/modal/modal.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { Subject, Subscription } from "rxjs";
import { ICarer, IRole, IHospitalData, IUserData } from 'src/app/interfaces/dashboard';
import { ICarehomeData, ICurrentUser } from 'src/app/interfaces/patient';

@Component({
  selector: 'app-carers',
  templateUrl: './carers.component.html',
  styleUrls: ['./carers.component.scss']
})
export class CarersComponent extends BasePageComponent implements OnInit, OnDestroy {

  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted: boolean = false;
  carers: ICarer[] = [];
  carersForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  roles: IRole[] = [];
  carehomeData: ICarehomeData[] = [];
  carehomeDataObj: any;
  hospitalData: IHospitalData[] = [];
  arrayFilter: ICarehomeData[] = [];
  isEdit: boolean = false;
  editId: string;
  deleteId: string;
  deleteUserId: string;
  hosId: string;
  currentUser: ICurrentUser[] = [];
  currentRole: any;
  unsub$: Subscription[] = [];
  subNum: number = 0;
  hs_name: string;
  chm_name: string;
  groupHospital: string[] = [];
  userData: IUserData[] = [];
  adminCarersHospital: string;
  loggedInManager: IUserData;
  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    private formBuilder: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {
    super(store, httpSv);

    this.pageData = {
      title: '',
      breadcrumbs: [
        {
          title: 'ROC',
          route: '/default-dashboard'
        },
        {
          title: 'Carer/Nurse',
          route: '/carers'
        }
      ]
    };
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;

    this.unsub$[++this.subNum] = this.route.queryParams.subscribe(params => {
      this.hosId = params['hid'];
      if (this.hosId) this.ngOnInit();
    })

  }
  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit() {
    super.ngOnInit();
    this.getRoles('rolesTest');

    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe(async (res: ICurrentUser[]) => {
      if (res) {
        this.currentUser = res;
        this.currentRole = this.currentUser[0].role['label'];
        if(this.currentRole=="carehome-manager"){
          this.getDataForManager(this.currentUser[0].uid);
          // this.getAcknowledgements("carehome-manager");
        }else if(this.currentRole=="roc-admin"){
          this.getDataForAdmin(this.currentUser[0].uid);
          // this.getAcknowledgements("roc-admin");
        }
        // this.currentRole === 'chm-group')
        if (this.currentRole === 'roc-admin' || this.currentRole === 'super-admin') {
          this.unsub$[++this.subNum] = this.rocService.getUser('hospitals').subscribe((res) => {
            if (res && res.length) {
              this.hospitalData = res
              this.hospitalData.map(x => {
                x.value = x.id,
                  x.label = x.name
              })
            }
            this.getCarerData('carers', 'setLoaded', this.hosId);
          })
        }
        if (this.currentRole === 'carehome-manager') {
          this.unsub$[++this.subNum] = this.rocService.getPatientByIdRole('carehome_manager', 'user.uid').subscribe(res => {
            if (res) this.carehomeData = res
            this.chm_name = this.carehomeData[0].fname + ' ' + this.carehomeData[0].lname;
            this.carehomeData[0].hospital.get().then((r) => {
            this.hs_name = r.data()['name']
            })
            this.getCarerData('carers', 'setLoaded', this.hosId);
          })
        }
        if (this.currentRole === 'chm-group') {
          this.unsub$[++this.subNum] = this.rocService.getPatientByIdRole('chm_group', 'user.uid').subscribe(res => {
            if (res) this.carehomeData = res
            this.carehomeDataObj = this.carehomeData[0]
            let hospitalData = [];
            this.carehomeData[0].hospital.forEach(element => {
              element.get().then((r) => {
                let x = r.data();
                if (x != undefined) {
                  this.hospitalData.push({
                    value: element.id,
                    label: x.name
                  })
                }
              })
            });
            this.hospitalData = [...hospitalData]
            this.getCarerData('carers', 'setLoaded', this.hosId);
          })
          this.unsub$[++this.subNum] = this.rocService.getUser('rocAdmin_settings').subscribe(set => {
            if (set && set.length > 0) this.adminCarersHospital = set[0]['num_carers']
          }, err => console.log(err))
        }
        // this.getCarerData('carers', 'setLoaded', this.hosId);
                
      }
    })

  }

  getDataForManager(uid: any): any {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhereHL('carehome_manager','user.uid',uid).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.loggedInManager=res[0];
      console.log("this loggedManager", this.loggedInManager)
    });
  }

  getDataForAdmin(uid: any): any {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhereHL('roc_admin','user.uid',uid).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.loggedInManager=res[0];
    });
  }

  getRoles(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(data => {
      if (data && data.length) {
        this.roles = [...data];
        console.log("this roles", this.roles)
        for (var i = 0; i < this.roles.length; i++) {
          this.roles[i].value = this.roles[i]['id'];
          delete this.roles[i].id;
        }
      }
    })
  }

  setCHGHospital() {
    let userData = this.userData;
    if (userData && userData.length > 0) this.groupHospital = userData[0].hospital.map(x => x.id)
    let newData = this.carers.filter(element => this.groupHospital.includes(element.hospital['id']))
    this.carers = [...newData]
    console.log('carers :: ', this.userData)
  }
  getCarerData(dataName: string, callbackFnName?: string, hospitalId?: string) {
    // setTimeout(()=>{
    let func;
    let refKeyAr = ['hospital', 'care_home'];
    console.log('hospitalId',hospitalId);
    
    
    if (hospitalId) {
      func = this.rocService.getUserByWhereRef(dataName, 'hospital', hospitalId, 'hospitals', refKeyAr)
    } else if(this.loggedInManager && (this.loggedInManager.hospital && this.loggedInManager.hospital.id!=='')) {
      func = this.rocService.getUserByWhereRef(dataName, 'hospital', this.loggedInManager.hospital.id, 'hospitals', refKeyAr)
    } else {
      func = this.rocService.getUserWithRef(dataName, refKeyAr)
    }
    this.unsub$[++this.subNum] = func.subscribe(
      data => {
        if (data) {
          console.log(data, "data-----------------")
          data.sort((a, b) => new Date(b.user['created_at']).getTime() - new Date(a.user['created_at']).getTime());
          data.map((x) => {
            x.email = x.user['email'],
              x.created_byTm = x.created_by['name'] + ' / ' + x.created_by['role'].label;
          })
          if (this.currentRole == 'carehome-manager') {
            this.arrayFilter = data.filter((x) => { return x.care_home['id'] == this.carehomeData[0].id });
            this[dataName] = [...this.arrayFilter];

          }
          if (this.currentRole == 'chm-group') {
            
            this.unsub$[++this.subNum] = this.rocService.getUserByWhere('chm_group', 'user.uid', this.currentUser[0].uid).subscribe((res: any) => {
              if (res && res.length > 0) this.userData = [...res];
              this[dataName] = [...data];
              this.setCHGHospital()
            })
          }
          else {
            var d = [];
            data.forEach((element, index, array) => {
              element.hospital.get().then((r,i) => {
                if(r) {
                  let x = r.data();
                  if(x)
                    array[index]["hospitalname"] = x.name;
                }
                
                
              })
            });
            
            // this[dataName] = data;
            this[dataName] = [...data];
            console.log('carers', this[dataName])
            
          }
          (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
        }
      },
      err => console.log(err)
    );
    // }, 100);
    
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  openModalDelete(body: any, header: any = null, footer: any = null, data: any = null) {
    this.deleteId = data.id;
    this.deleteUserId = data['user']['uid'];
    this.modal.open({
      body: body,
      header: header,
      footer: footer
    });
  }
  deleteOk() {
    this.unsub$[++this.subNum] = this.httpSv.deleteAuthUser(this.deleteUserId).subscribe((res: any) => {
      if (res.message == 'Success') {
        this.rocService.deleteUser('carers', this.deleteId).then((res) => {
          this.generalService.showSuccess("Record Successfully Deleted!!", "")
          this.modal.close();

        }, err => {
          this.generalService.showError(err.message, "");
        });
        // this.rocService.getUserByWhere('user_role', 'uid', this.deleteId).subscribe(res => {
        //   if (res.length) this.rocService.deleteUser('user_role', res[0].id)
        // })
      }
    }, err => {
      this.generalService.showError(err.error.message.message, "");
    })
    // this.rocService.deleteUser('carers', this.deleteId).then((res) => {
    //   this.modal.close();
    //   this.generalService.showSuccess("Record Successfully Deleted!!", "")
    // }, err => {
    //   console.log("ERR", err)
    //   this.generalService.showError(err.message, "");
    // });
  }

  openModal(body: any, header: any = null, footer: any = null, data: any = null) {
    this.initForm();
    if (data) {
      this.editForm(data);
      this.editId = data.id;
      this.isEdit = true;
    }
    else {
      this.isEdit = false;
    }
    this.modal.open({
      body: body,
      header: header,
      footer: footer
    });
  }

  closeModal() {
    this.modal.close();
    if (!this.isEdit) this.carersForm.reset();
    this.submitted = false
  }

  initForm(data?: any) {
    this.carersForm = this.formBuilder.group({
      fname: [(data ? data.fname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: [(data ? data.lname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      email: [(data ? data.email : ''), [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      password: [(data ? data.password : ''), [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      cpassword: [(data ? data.password : ''), [Validators.required]],
      cstatus:[(data ? data.cstatus : true)],
      // cost: ['', [Validators.required, Validators.pattern(/^-?\d*(\.\d+)?$/)]],
      hospital: ['', this.currentRole == 'roc-admin' || this.currentRole == 'super-admin' ? [Validators.required] : []],
      //care_home: ['', this.currentRole == 'roc-admin' || this.currentRole == 'super-admin' ? [Validators.required] : []],
      care_home: ['', this.currentRole == 'roc-admin' || this.currentRole == 'super-admin' ? []: []],
    },
      {
        validator: this.rocService.ConfirmedValidator('password', 'cpassword')
      });
  }

  editForm(data: any) {
    let hospital_obj = this.hospitalData && this.hospitalData.find(c => c.id == data.hospital.id)
    this.carersForm = this.formBuilder.group({
      fname: [(data ? data.fname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: [(data ? data.lname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      hospital: [(hospital_obj ? data.hospital.id : ''), [Validators.required]],
      // cost: [(data ? data.cost : ''), [Validators.required, Validators.pattern(/^-?\d*(\.\d+)?$/)]],
    });
    
  }

  edit(row: any) {
    this.openModal(this.modalBody, 'Edit carer', this.modalFooter, row);
  }

  remove(tableRow: any) {
    this.openModalDelete("You want to delete user?", "Are you sure?", this.modalDelete, tableRow)
  }

  onHospitalSelect(event) {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhereRef('carehome_manager', 'hospital', event.value, 'hospitals').subscribe((res) => {
      if (res && res.length) {
        this.carehomeData = res
        this.carehomeData.map(x => {
          x.value = x.id,
            x.label = x.fname + ' ' + x.lname
        })
      }
    })
  }

  addCarer(value) {
    this.submitted = true;
    if (this.carersForm.invalid) {
      return;
    }
    else {
      if (this.isEdit) {
        var dataObj = {
          "fname": value.fname,
          "lname": value.lname,
          "hospital":this.firestore.doc(`/hospitals/${value.hospital}`).ref,
          // "cost": value.cost,
          "updated_at": new Date().toDateString() + ' ' + new Date().toLocaleTimeString(),
        }

        this.rocService.updateUser('carers', dataObj, this.editId).then((res) => {
          this.generalService.showSuccess("Record Successfully Updated!!", "")
          this.closeModal();
        }, (err) => {
          this.generalService.showError(err.message, "");

        })

      }
      else {
        var rolesObj = this.roles && this.roles.find(c => c.label == "nurse");
        let hospital_obj;
        // let CH_obj;
        //for hospital
        if (value.hospital == '') {
          value['hospital'] = (this.carehomeData.length > 0) && this.carehomeData[0].hospital;
        } else {
          hospital_obj = this.hospitalData && this.hospitalData.find(c => c.id == value.hospital)
          value.hospital = this.firestore.doc(`/hospitals/${value.hospital}`).ref
        }

        //for carehome
        // if (value.care_home == '') {
        //   CH_obj = this.carehomeData && this.carehomeData.find(c => c.id == this.carehomeData[0].id)
        //   value.care_home = this.firestore.doc(`/carehome_manager/${this.carehomeData[0].id}`).ref
        // } else {
        //   CH_obj = this.carehomeData && this.carehomeData.find(c => c.id == value.care_home)
        //   value.care_home = this.firestore.doc(`/carehome_manager/${value.care_home}`).ref
        // }

        value['role'] = rolesObj;
        value['created_by'] = this.currentUser[0];
        value.is_deleted = false;
        value.updated_at = null;

        // let mailObj = {};
        
        // this.rocService.getUserById('carehome_manager', CH_obj.id).subscribe((res: any) => {
        //   if (res) mailObj['carehomeMail'] = res['user']['email']
        // })

        // if (this.currentRole == 'roc-admin' || this.currentRole == 'super-admin') {
        //   this.hs_name = hospital_obj['name'];
        //   this.chm_name = CH_obj['fname'] + ' ' + CH_obj['lname'];
        // }

        // mailObj['msg'] = `<h2>Hello, New Nurse is added in the system.Please find the following details.</h2>
        // <h3>Full Name :</h3> ${value.fname} ${value.lname}
        // <h3>Care Home manager :</h3> ${this.chm_name}
        //  <h3>Hospital :</h3> ${this.hs_name}`;
        this.rocService.createNewUser('carers', value)
          .then((res => {
            this.generalService.showSuccess("Carer Successfully Added!!", "")
            this.closeModal();
            // this.sendMail(mailObj);
            // let arg = {
            //   'createdEmail': value.email,
            //   'msg': `<h2>Hello ${value.fname}, you are registered as Nurse.Please find the following login details</h2>
            //    <h3>Email : ${value.email}</h3> 
            //    <h3>Password : ${value.password} </h3>
            //    <h3>Hospital name : ${this.hs_name}</h3>`
            // }
            // this.sendMailToUser(arg)
          }), err => {
            console.log(err)
            this.generalService.showError(err.message, "");
          })
      }
    }
  }

  sendMail(data) {
    this.unsub$[++this.subNum] = this.httpSv.sendMail(data).subscribe((res) => {
    })
  }
  sendMailToUser(data) {
    this.unsub$[++this.subNum] = this.httpSv.sendMail(data).subscribe((res) => {
    })
  }

  get f() { return this.carersForm.controls; }

  onSwitch(data:any) {
    debugger
    let dataObj={
      cstatus:!data.cstatus
    };
    this.rocService.updateUser('carers', dataObj, data.id).then((res) => {
      this.generalService.showSuccess("Status Updated Successfully!!", "")
    }, (err) => {
      this.generalService.showError(err.message, "");
    })
  }
}
