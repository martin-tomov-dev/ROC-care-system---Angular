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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-careHome-manager',
  templateUrl: './careHome-manager.component.html',
  styleUrls: ['./careHome-manager.component.scss']
})
export class CareHomeManagerComponent extends BasePageComponent implements OnInit, OnDestroy {
  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted = false;
  carehome_manager: any[] = [];
  hospitals: any[] = [];
  carehomeForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  roles: any[] = [];
  arrayFilter: any[] = [];
  isEdit = false;
  editId;
  deleteId;
  unsub$: Subscription[] = [];
  subNum: number = 0;
  deleteUserAuthId;
  hosId;
  currentUser: any;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    private formBuilder: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,

  )
   {
    super(store, httpSv);

    this.pageData = {
      title: '',
      breadcrumbs: [
        {
          title: 'ROC',
          route: '/default-dashboard'
        },
        {
          title: 'Care Home',
          route: '/carehome_manager'
        }
      ]
    };
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;

    this.unsub$[++this.subNum] = this.route.queryParams.subscribe(params => {
      this.hosId = params['hid'];
      if (this.hosId) {
        this.getDataByhospital('carehome_manager', this.hosId, 'setLoaded');
      }
      else {
        this.getCareHomedata('carehome_manager', 'setLoaded');
      }
    });
  }

  ngOnInit() {

    super.ngOnInit();
    this.getRoles('rolesTest');
    this.getHospitals('hospitals');
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res) => {
      if (res && res.length) this.currentUser = res
    })
  }
 

  getDataByhospital(coll, id, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhereRef(coll,'hospital',id,'hospitals').subscribe((res: any) => {
      if (res && res.length) {
        let arrayFilter = res;
        arrayFilter.map(element => {
            
          element['hospital'].get().then(r => {
            element['hospital'] = r.data()
            element['hospital']['id'] = r['id']
            element['hospitalName'] = r.data()['name']
          })
        });
            arrayFilter.map((x) => {
              x.email = x.user['email'],
              x.created_by = x.admin_id['name'] + ' / ' + x.admin_id['role'].label;
            })
     
        this[coll] = arrayFilter;
      }

      (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[coll]) : null;

    })
  }

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

  getHospitals(dataName) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe((res) => {
      // console.log("Coll postt::",res)
      if (res && res.length) {
        this.hospitals = res
        this.hospitals.map(x => {
          x.value = x.id,
            x.label = x.name
        })
      }
    }, err => console.log(err))
  }



  getCareHomedata(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUserWithRef(dataName,['hospital']).subscribe(
      data => {
        if (data) {
          let arrayFilter = data
          arrayFilter.map(element => {
            
            element['hospital'].get().then(r => {
              element['hospital'] = r.data()
              element['hospital']['id'] = r['id']
              element['hospitalName'] = r.data()['name']
            })
          });
          arrayFilter.sort((a, b) => new Date(b.user['created_at']).getTime() - new Date(a.user['created_at']).getTime());

          arrayFilter.map((x) => {
            x.email = x.user['email'],
            x.created_by = x.admin_id['name'] + ' / ' + x.admin_id['role'].label;
          })
          this[dataName] = arrayFilter;
          (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
        }
      },
      err => console.log(err)
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  openModalDelete(body: any, header: any = null, footer: any = null, data: any = null) {
    console.log('data', data.user.uid)
    this.deleteId = data.id;
    this.deleteUserAuthId = data.user.uid;
    this.modal.open({
      body: body,
      header: header,
      footer: footer
    });
  }
  deleteOk() {
    // var dataObj = { is_deleted: true }
    
    this.rocService.deleteUser('carehome_manager', this.deleteId).then((res) => {
      this.authService.deleteUser(this.deleteUserAuthId)
      .then((res) => {
        this.modal.close();
        this.generalService.showSuccess("Record Successfully Deleted!!", "")
      }, err => {
        this.generalService.showError(err,"")
        this.submitted=false;
        console.log(err);
      })
      

    }, err => {
      console.log("ERR", err)
      this.generalService.showError(err.message, "");
    });
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
    if (!this.isEdit) this.carehomeForm.reset();
    this.submitted = false
  }

  initForm(data?: any) {
    this.carehomeForm = this.formBuilder.group({
      fname: ['', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: ['', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      hospital: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      password: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      cpassword: ['', [Validators.required]]
    },
      {
        validator: this.rocService.ConfirmedValidator('password', 'cpassword')
      });
  }

  editForm(data: any) {
    this.carehomeForm = this.formBuilder.group({
      fname: [(data ? data.fname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: [(data ? data.lname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      hospital: [(data ? data.hospital['id'] : ''), [Validators.required]],
    });
  }

  edit(row: any) {
    this.openModal(this.modalBody, 'Edit care Home manager', this.modalFooter, row);
  }

  remove(tableRow: any) {
    this.openModalDelete("You want to delete user?", "Are you sure?", this.modalDelete, tableRow)
  }

  addCarehome(value) {
    this.submitted = true;
    if (this.isEdit) {
      if (this.carehomeForm.invalid) {
        return;
      } else {

        value.hospital = this.firestore.doc(`/hospitals/${value.hospital}`).ref

        var dataObj = {
          "fname": value.fname,
          "lname": value.lname,
          "hospital": value.hospital,
          "updated_at": new Date(),
        }
        // console.log("dataobj:",dataObj)
        // return;
        this.rocService.updateUser('carehome_manager', dataObj, this.editId).then((res) => {
          this.generalService.showSuccess("Record Successfully Updated!!", "")
          this.closeModal();
        
        }, (err) => {
          console.log("ERR::", err)
          this.generalService.showError(err.message, "");

        })
      }

    }
    else {

      if (this.carehomeForm.invalid) {
        return;
      }
      else {
        
        var rolesObj = this.roles && this.roles.find(c => c.label == "carehome-manager");
        value.hospital = this.firestore.doc(`/hospitals/${value.hospital}`).ref
        value['role'] = rolesObj;
        value['admin_id'] = this.currentUser[0];
        value.auth_token = null;
        value.facebook_authentication = null;
        value.google_authentication = null;
        value.is_deleted = false;
        value.updated_at = null;

        let mailObj = {};

        mailObj['msg'] = `<h2>Hello, New manager is added in the system. </h2>
        <h3>Full Name :</h3> ${value.fname} ${value.lname}
        <h3>Email :</h3> ${value.email}
        <h3>Business :</h3> ${value.hospital['name']}`;
        
        // console.log("Mail objj::",mailObj)
        // console.log("value::",value)
        // return;
        this.rocService.createNewUser('carehome_manager', value)
          .then((res => {
            this.generalService.showSuccess("Carehome manager Successfully Added!!", "")
            this.closeModal();
            this.sendMail(mailObj);
            let arg = {
              'createdEmail': value.email,
              'msg': `<h2>Hello ${value.fname}, you are registered as Manager.Please find the following login details.</h2>
               <h3>Email : ${value.email}</h3> 
               <h3>Password : ${value.password} </h3>`
              // <h3>Hospital name : ${value.hospital['name']}</h3>`
            }
            this.sendMailToUser(arg);
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

  get f() { return this.carehomeForm.controls; }
}
