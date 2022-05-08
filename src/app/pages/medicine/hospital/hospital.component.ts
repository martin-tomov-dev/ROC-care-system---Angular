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
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ICountrydata, IHospitalData, ICarer, IRole, IUserData } from 'src/app/interfaces/dashboard';
import { IPatient, ICurrentUser } from 'src/app/interfaces/patient';

@Component({
  selector: 'app-hospital',
  templateUrl: './hospital.component.html',
  styleUrls: ['./hospital.component.scss']
})
export class HospitalComponent extends BasePageComponent implements OnInit, OnDestroy {

  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalBodyCHM', { static: true }) modalBodyCHM: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalFooterCHM', { static: true }) modalFooterCHM: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted: boolean = false;
  countryData: ICountrydata[];
  hospitals: IHospitalData[] = [];
  allHospitals: any[] = [];
  carehome_manager: any[] = [];
  carers: ICarer[] = [];
  patients: IPatient[] = [];
  roles: IRole[] = [];
  chm_group: any[] = [];
  chm_user_group: any;
  hospitalForm: FormGroup;
  carehomeForm: FormGroup;
  isEdit: boolean = false;
  editId: string;
  deleteId: string;
  hid: string;
  currentUser: ICurrentUser[];
  // totalPT: any[] = [];
  groupHospital: any[] = [];
  userData: IUserData[] = []
  userDataObj;
  authDetails: any;
  currentChmManager: any;
  adminNumHospital: any;
  unsub$: Subscription[] = [];
  subNum: number = 0;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    private formBuilder: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public authService: AuthService,
    public router: Router,
    private firestore: AngularFirestore,

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
          title: 'Hospitals/Carehomes',
          route: '/hospitals'
        }
      ]
    };
  }

  ngOnInit() {

    super.ngOnInit();
    this.getRoles('rolesTest');
    this.getDataCountry('assets/data/country.json', 'countryData', 'setLoaded');
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res: ICurrentUser[]) => {
      if (res && res.length) this.currentUser = res;
      console.log(res)
    })
    this.unsub$[++this.subNum] = this.rocService.getUserByWhere('chm_group', 'user.uid', localStorage.getItem('currentuser')).subscribe(cu => {
      console.log('CU :: ', cu)
      if (cu?.length) this.currentChmManager = cu[0];
      this.getHospitalData('hospitals', 'setLoaded');
    })
    // this.getHospitalData('hospitals', 'setLoaded');
    this.unsub$[++this.subNum] = this.firestore.collection("rocAdmin_settings").valueChanges()
      .subscribe(
        data => {
          this.authDetails = data[0];
          // console.log(this.authDetails);
        },
        err => {
          console.log(err);
        });
        this.unsub$[++this.subNum] = this.rocService.getUser("hospitals").subscribe((res) => {
      this.hospitals = [];
      if (res && res.length) {
        this.hospitals = res
        this.hospitals.map(x => {
          x.value = x.id,
            x.label = x.name
        })
      }
    }, err => console.log(err))

    this.unsub$[++this.subNum] = this.rocService.getUser("chm_group").subscribe(
      data => {
        // console.log("data::",data)
        if (data) {
          let arrayFilter = data
          arrayFilter.sort((a, b) => new Date(b.user['created_at']).getTime() - new Date(a.user['created_at']).getTime());

          arrayFilter.map((x) => {
            x.email = x.user['email'],
              x.created_by = x.admin_id['name'] + ' / ' + x.admin_id['role'].label;
          })
          this.allHospitals = arrayFilter;
          // console.log( this.allHospitals)
        }


      },
      err => console.log(err)
    );

    this.unsub$[++this.subNum] = this.rocService.getUser("chm_group").subscribe(
      data => {
        // console.log("data::",data)
        if (data) {
          let arrayFilter = data
          arrayFilter.sort((a, b) => new Date(b.user['created_at']).getTime() - new Date(a.user['created_at']).getTime());

          arrayFilter.map((x) => {
            x.email = x.user['email'],
              x.created_by = x.admin_id['name'] + ' / ' + x.admin_id['role'].label;
          })
          this.chm_group = arrayFilter;
          // console.log( this.chm_group)
        }


      },
      err => console.log(err)
    );
  }

  getDataCountry(url: string, dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.httpSv.getData(url).subscribe(
      data => {
        this[dataName] = data;
        console.log("this countrydata", data);
      },
      err => {
        console.log(err);
      },
      () => {
        (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
      }
    );
  }

  setCHGHospital() {
    let userData = this.userData;
    if (userData && userData.length > 0) this.groupHospital = userData[0].hospital && userData[0].hospital.map(x => x.id)
    let newData = this.hospitals.filter(element => this.groupHospital.includes(element.id))
    this.hospitals = [...newData]
  }

  getHospitalData(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(
      // this.rocService.getUserByWhere(dataName, 'created_by', this.currentChmManager ? this.currentChmManager.id : null)
      // .subscribe(
      data => {
        if (data) {
          let arrayFilter = data
          arrayFilter.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          arrayFilter.map(m => {
            m.countryname = m.country['label']
          })
          this[dataName] = arrayFilter;
          if (this.currentUser[0].role['label'] == 'chm-group') {
            this.unsub$[++this.subNum] = this.rocService.getUserByWhere('chm_group', 'user.uid', this.currentUser[0].uid).subscribe((res: any) => {
              if (res && res.length > 0) this.userData = [...res];
              console.log('userData :: ', this.userData)
              this.userDataObj = this.userData[0]
              if (!this.userData[0]['num_hospitals']) {
                this.unsub$[++this.subNum] = this.rocService.getUser('rocAdmin_settings').subscribe(set => {
                //  console.log('SET :: ', set)
                  if (set && set.length > 0) this.adminNumHospital = set[0]['num_hospital']
                }, err => console.log(err))
              }
              this.setCHGHospital()
            })
          }
          this.getAllCount('carehome_manager');
          this.getAllCount('carers');
          this.getAllCount('patients');

          (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
        }
      },
      err => console.log(err)
    );
  }

  getAllCount(dataName) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe((res) => {
      if (res && res.length) {
        this[dataName] = res;
        this.hospitals.map((x) => {
          let orange = [];
          let red = [];
          let green = [];

          let count_CH = [];
          let count_CR = [];
          let count_PT = [];

          this.carehome_manager.find(y => {
            if (x.id == y.hospital['id']) {
              count_CH.push(y)
              x['count_CH'] = count_CH.length;
            }
          })

          this.carers.find(y => {
            if (x.id == y.hospital['id']) {
              count_CR.push(y)
              x['count_CR'] = count_CR.length;
            }
          })
          console.log('this.patients ', this.patients)
          if (this.patients.length > 0) {
            this.patients.find(y => {
              if (y.hospital && y.hospital['id']) {
                if (x.id == y.hospital['id']) {
                  count_PT.push(y)
                  x['count_PT'] = count_PT.length;

                  if (y.drink == 'Orange' && y.is_active) orange.push(y)
                  if (y.drink == 'Red' && y.is_active) red.push(y)
                  if (y.drink == 'Green' && y.is_active) green.push(y)

                  let totalCount = (red && red.length) + (green && green.length) + (orange && orange.length);
                  x['roc_drink'] = {
                    "red": Math.round((red.length * 100) / totalCount),
                    "green": Math.round((green.length * 100) / totalCount),
                    "orange": Math.round((orange.length * 100) / totalCount)
                  }
                }
              }
            })
          }
        })
      }
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  openModalDelete(body: any, header: any = null, footer: any = null, data: any = null) {
    this.deleteId = data.id;
    this.modal.open({
      body: body,
      header: header,
      footer: footer
    });
  }

  deleteOk() {
    this.rocService.deleteUser('hospitals', this.deleteId).then(res => {
      this.modal.close();
      this.generalService.showSuccess("Record Successfully Deleted!!", "")
    }, err => {
      this.generalService.showError(err.message, "");
    })
  }

  initForm(data?: any) {
    this.hospitalForm = this.formBuilder.group({
      name: [(data ? data.name : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z0-9\\s()-]+$")]],
      phone: [(data ? data.phone : ''), [Validators.required, Validators.pattern("^[0-9\+]{8,13}$")]],
      address: [(data ? data.address : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z0-9\\s()-]+$")]],
      address1: [(data ? data.address1 : ''), [Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z0-9\\s()-]+$")]],
      town: [(data ? data.town : ''), [Validators.required]],
      postcode: [(data ? data.postcode : ''), [Validators.required, Validators.pattern("[a-zA-Z0-9\+]{4,20}$")]],
      country: [(data ? data.country['value'] : ''), [Validators.required]]
    });
  }


  initFormCHM() {
    this.carehomeForm = this.formBuilder.group({
      fname: ['', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: ['', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      email: ['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      password: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      cpassword: ['', [Validators.required]]
    },
      {
        validator: this.rocService.ConfirmedValidator('password', 'cpassword')
      });
  }

  openModal(body: any, header: any = null, footer: any = null, data: any = null) {
    this.initForm(data);
    if (data) {
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
    if (!this.isEdit) this.hospitalForm.reset();
    this.submitted = false
  }

  closeModalCHM() {
    this.modal.close();
    this.carehomeForm.reset();
    this.submitted = false
  }

  edit(row: any) {
    this.openModal(this.modalBody, 'Edit Hospital', this.modalFooter, row);
  }

  remove(tableRow: any) {
    this.openModalDelete("You want to delete record?", "Are you sure?", this.modalDelete, tableRow)
  }

  addCarehome(id) {

    this.initFormCHM();
    this.openModalForCHM(this.modalBodyCHM, 'Add Carehome manager', this.modalFooterCHM, id)
  }

  openModalForCHM(body: any, header: any = null, footer: any = null, data: any = null) {
    this.hid = data;
    this.modal.open({
      body: body,
      header: header,
      footer: footer
    });
  }


  addHospital(value) {
    let priviusLength
    let afterLength
    priviusLength = this.allHospitals.length
    // console.log(this.authDetails.num_hospital);
    // console.log(this.hospitals.length)
    console.log(this.isEdit)
    console.log(value)
    console.log(this.hospitals)
    this.submitted = true;

    if (localStorage.getItem("currentuser")) {
      let current_user = localStorage.getItem("currentuser");
      console.log(current_user)
      for (let i = 0; i < this.chm_group.length; i++) {
        console.log(this.chm_group[i].admin_id.uid)
        if (this.chm_group[i].user.uid == current_user) {
          this.chm_user_group = this.chm_group[i]
        }

      }
    }
    // showWarning
    if (this.hospitalForm.invalid) {
      return;
    }
    else {
      //if edit mode
      if (this.isEdit) {
        let countryObj = this.countryData && this.countryData.find(c => c.value == value.country)
        var dataObj = {
          "name": value.name,
          "phone": value.phone,
          "address": value.address,
          "address1": value.address1,
          "town": value.town,
          "postcode": value.postcode,
          "country": countryObj,
          "updated_at": new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
        }
        // return
        this.rocService.updateUser('hospitals', dataObj, this.editId).then((res) => {
          this.closeModal();
          this.generalService.showSuccess("Data Successfully Updated!!", "")
        }, (err) => {
          console.log("ERR::", err)
          this.generalService.showError(err.message, "");

        })
      }
      //add data
      else if (this.chm_user_group != undefined) {
        if (((+this.chm_user_group.num_hospitals || this.adminNumHospital) + this.chm_user_group.by_admin) <= this.hospitals.length) {
          this.generalService.showWarning("New Hospital Not Approved By Admin", "")
        } else {
          let countryObj = this.countryData && this.countryData.find(c => c.value == value.country)
          value.country = countryObj;
          value.updated_at = null;
          value.created_at = new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
          value.created_by = this.firestore.doc(`/chm_group/${this.userData[0]['id']}`).ref;

          let newHosp = []
          let newAry = [];

          this.rocService.addRecord('hospitals', value).then((res) => {
            this.closeModal();
            this.generalService.showSuccess("Data Successfully Added!!", "")
            this.setCHGHospital()
            console.log('this.hospitals :: ', this.hospitals)
            setTimeout(() => {
              newHosp = [...this.hospitals.map(h => h.id), res['id']]
              newHosp.forEach(element => {
                newAry.push(this.firestore.doc(`/hospitals/${element}`).ref)
              });
              console.log(newAry);
              var dataObj = {
                "hospital": newAry
              }
              this.rocService.updateUser('chm_group', dataObj, this.userData[0]['id']).then(u => {
                console.log("Data Successfully Added!!")
              }).catch(err => console.log(err))
            }, 1000)
          }, err => {
            this.generalService.showError(err.message, "");
          })
          if (!!this.chm_user_group) {

            // this.allHospitals = []
            // this.rocService.getUser("hospitals").subscribe((res) => {
            //   // console.log("Coll postt::",res)
            //   if (res && res.length) {
            //     this.allHospitals = res
            //     this.allHospitals.map(x => {
            //       x.value = x.id,
            //         x.label = x.name
            //     })
            //     afterLength = this.allHospitals.length
            //   }
            // }, err => console.log(err));
          }

        }

      } else {
        let countryObj = this.countryData && this.countryData.find(c => c.value == value.country)
        value.country = countryObj;
        value.updated_at = null;
        value.created_at = new Date().toDateString() + ' ' + new Date().toLocaleTimeString()

        this.rocService.addRecord('hospitals', value).then((res) => {
          console.log('RES :: ', res)
          this.closeModal();
          this.generalService.showSuccess("Data Successfully Added!!", "")
        }, err => {
          this.generalService.showError(err.message, "");
        })
      }
    }
  }

  get f() { return this.hospitalForm.controls; }

  //for CHM add update
  get f1() { return this.carehomeForm.controls; }

  getRoles(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(data => {
      if (data && data.length) {
        this.roles = [...data];
        for (var i = 0; i < this.roles.length; i++) {
          this.roles[i].value = this.roles[i]['id'];
          delete this.roles[i].id;
        }
      }
    })
  }


  CarehomeSubmit(value) {
    this.submitted = true;
    if (this.carehomeForm.invalid) {
      return;
    }
    else {
      console.log(this.hid)
      var rolesObj = this.roles && this.roles.find(c => c.label == "carehome-manager");
      let hospital_obj = this.hospitals && this.hospitals.find(c => c.id == this.hid)

      value.hospital = this.firestore.doc(`/hospitals/${this.hid}`).ref;
      value['role'] = rolesObj;
      value['admin_id'] = this.currentUser[0];
      value.auth_token = null;
      value.facebook_authentication = null;
      value.google_authentication = null;
      value.is_deleted = false;
      value.updated_at = null;

      let mailObj = {};

      mailObj['msg'] = `<h2>Hello, New Care Home manager is added in the system. </h2>
        <h3>Full Name :</h3> ${value.fname} ${value.lname}
        <h3>Email :</h3> ${value.email}
        <h3>Hospital :</h3> ${hospital_obj['name']}`;

      // console.log("mail obj",mailObj)
      // console.log("Form Value:",value)
      // console.log("value.hospital_obj['name']",hospital_obj['name'])
      // return;
      this.rocService.createNewUser('carehome_manager', value)
        .then((res => {
          this.generalService.showSuccess("Hospital record Successfully Added!!", "")
          this.closeModalCHM();
          this.sendMail(mailObj);
          let arg = {
            'createdEmail': value.email,
            'msg': `<h2>Hello ${value.fname}, you are registered as Care home manager.Please find the following login details.</h2>
               <h3>Email : ${value.email}</h3> 
               <h3>Password : ${value.password} </h3>
              <h3>Hospital name : ${hospital_obj['name']}</h3>`
          }
          this.sendMailToUser(arg);
        }), err => {
          console.log(err)
          this.generalService.showError(err.message, "");
        })

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


}
