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
import { IRole, IHospitalData, IUserData } from 'src/app/interfaces/dashboard';
import { ICurrentUser } from 'src/app/interfaces/patient';

@Component({
  selector: 'app-chm-group',
  templateUrl: './chm-group.component.html',
  styleUrls: ['./chm-group.component.scss']
})
export class ChmGroupComponent extends BasePageComponent implements OnInit, OnDestroy  {
  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted: boolean = false;
  chm_group: IUserData[] = [];
  hospitals: IHospitalData[] = [];
  chmGroupForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  roles: IRole[] = [];
  arrayFilter: IUserData[] = [];
  unsub$: Subscription[] = [];
  subNum: number = 0;
  isEdit: boolean = false;
  editId: string;
  deleteId: string;
  deleteUserId: string;
  // hosId;
  currentUser: ICurrentUser[];

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
          title: 'CHM Groups',
          route: '/chm-group'
        }
      ]
    };
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;
    this.getCHM_GroupData('chm_group','setLoaded');
  }

  ngOnInit() {
    super.ngOnInit();
    this.getRoles('rolesTest');
    this.getHospitals('hospitals');
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res: ICurrentUser[]) => {
      if (res && res.length) this.currentUser = res
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

  getCHM_GroupData(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(
      data => {
        // console.log("data::",data)
        if (data) {
          let arrayFilter = data
          arrayFilter.sort((a, b) => new Date(b.user['created_at']).getTime() - new Date(a.user['created_at']).getTime());

          arrayFilter.map((x) => {
            x.email = x.user['email'],
            x.created_by = x.admin_id['name'] + ' / ' + x.admin_id['role'].label;
          })
          console.log("this chm group", arrayFilter)
          this[dataName] = arrayFilter;
        }
        (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;

      },
      err => console.log(err)
    );

  }

  initForm(data?: any) {
    this.chmGroupForm = this.formBuilder.group({
      fname: ['', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: ['', [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      hospital: ['', [Validators.required]],
      num_hospitals: ['',[Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      num_chm: ['',[Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      num_carers: ['',[Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      num_patients: ['',[Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      email: ['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      password: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      cpassword: ['', [Validators.required]]
    },
      {
        validator: this.rocService.ConfirmedValidator('password', 'cpassword')
      });
  }

  get f() { return this.chmGroupForm.controls; }

  editForm(data: any) {
    let ary = data.hospital.map(x=>x.id);

    this.chmGroupForm = this.formBuilder.group({
      fname: [(data ? data.fname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: [(data ? data.lname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      hospital: [(data ? ary : []), [Validators.required]],
      num_hospitals: [(data ? data.num_hospitals : '')],
      num_chm: [(data ? data.num_chm : '')],
      num_carers: [(data ? data.num_carers : '')],
      num_patients: [(data ? data.num_patients : '')],
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
    if (!this.isEdit) this.chmGroupForm.reset();
    this.submitted = false
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

  edit(row: any) {
    this.openModal(this.modalBody, 'Edit Care Home manager group', this.modalFooter, row);
  }

  remove(tableRow: any) {
    this.openModalDelete("You want to delete user?", "Are you sure?", this.modalDelete, tableRow)
  }

  deleteOk() {
    // var dataObj = { is_deleted: true }
    this.unsub$[++this.subNum] = this.httpSv.deleteAuthUser(this.deleteUserId).subscribe((res: any) => {
      if (res.message == 'Success') {
        this.rocService.deleteUser('chm_group', this.deleteId).then((res) => {
          this.modal.close();
          this.generalService.showSuccess("Record Successfully Deleted!!", "")
        }, err => {
          console.log("ERR", err)
          this.generalService.showError(err.message, "");
        });
        // this.rocService.getUserByWhere('user_role', 'uid', this.deleteId).subscribe(res => {
        //   if (res.length) this.rocService.deleteUser('user_role', res[0].id)
        // })
      }
    }, err => {
      this.generalService.showError(err.error.message.message, "");
    })

    
  }

  addCHM_Group(value) {
    this.submitted = true;
    if (this.isEdit) {
      if (this.chmGroupForm.invalid) {
        return;
      } else {

        var rolesObj = this.roles && this.roles.find(c => c.label == "chm-group");
        let hAry = value.hospital
        let newAry = [];
        hAry.forEach(element => {
          newAry.push(this.firestore.doc(`/hospitals/${element}`).ref)
        });
        value.hospital = newAry;
        var dataObj = {
          "fname": value.fname,
          "lname": value.lname,
          "hospital": value.hospital,
          "num_hospitals":value.num_hospitals,
          "num_chm":value.num_chm,
          "num_carers":value.num_carers,
          "num_patients":value.num_patients,
          "updated_at": new Date(),
          "by_admin": newAry.length
        }
        console.log('dataObj ',dataObj)
        this.rocService.updateUser('chm_group', dataObj, this.editId).then((res) => {
          console.log(res)
          this.generalService.showSuccess("Record Successfully Updated!!", "")
          this.closeModal();
        
        }, (err) => {
          console.log("ERR::", err)
          this.generalService.showError(err.message, "");

        })
      }

    }
    else {

      if (this.chmGroupForm.invalid) {
        return;
      }
      else {
        
        var rolesObj = this.roles && this.roles.find(c => c.label == "chm-group");
        let hAry = value.hospital
        let newAry = [];
        hAry.forEach(element => {
          newAry.push(this.firestore.doc(`/hospitals/${element}`).ref)
        });
        value.hospital = newAry;
        value['role'] = rolesObj;
        value['admin_id'] = this.currentUser[0];
        value.auth_token = null;
        value.facebook_authentication = null;
        value.google_authentication = null;
        value.is_deleted = false;
        value.updated_at = null;
        value['by_admin'] = newAry.length

        let mailObj = {};

        mailObj['msg'] = `<h2>Hello, New Care Home manager group is added in the system. </h2>
        <h3>Full Name :</h3> ${value.fname} ${value.lname}
        <h3>Email :</h3> ${value.email}`        
        // console.log("Mail objj::",mailObj)
        // console.log("msg::",value)
        // return;
        this.rocService.createNewUser('chm_group', value)
          .then((res => {
            this.generalService.showSuccess("Record Successfully Added!!", "")
            this.closeModal();
            this.sendMail(mailObj);
            let arg = {
              'createdEmail': value.email,
              'msg': `<h2>Hello ${value.fname}, you are registered as Care home manager group.Please find the following login details.</h2>
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


  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  

}
