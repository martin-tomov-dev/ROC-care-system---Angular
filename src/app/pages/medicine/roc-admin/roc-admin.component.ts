
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BasePageComponent } from '../../base-page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { TCModalService } from '../../../ui/services/modal/modal.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roc-admin',
  templateUrl: './roc-admin.component.html',
  styleUrls: ['./roc-admin.component.scss']
})
export class RocAdminComponent extends BasePageComponent implements OnInit, OnDestroy {
  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted: boolean = false;
  roc_admin: any[] = [];
  rocAdminForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  roles: any[] = [];
  unsub$: Subscription[] = [];
  subNum: number = 0;
  currentUser: any;
  currentRole: string;
  isEdit: boolean = false;
  editId: string;
  deleteId: string;
  deleteUserId: string;
  // count;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    private formBuilder: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
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
          title: 'ROC Admin',
          route:'/roc_admin'
        }
      ]
    };
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;
  }

  ngOnInit() {
    super.ngOnInit();
    this.getROCData('roc_admin', 'setLoaded');
    this.getRoles('rolesTest')
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res) => {
      if (res && res.length) {
        this.currentUser = res
        this.currentRole = this.currentUser[0].role['label']
      }
    })

  }

  getRoles(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(data => {
      if (data) {
        this.roles = [...data];
        for (var i = 0; i < this.roles.length; i++) {
          this.roles[i].value = this.roles[i]['id'];
          delete this.roles[i].id;
        }
      }
    })
  }

  getROCData(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe(
      data => {
        if(data){
        let arrayFilter = data
        arrayFilter.sort((a, b) => new Date(b.user['created_at']).getTime() - new Date(a.user['created_at']).getTime());
        arrayFilter.map((x) => {
          x.email = x.user['email'],
            x.created_at = x.user['created_at']
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
        this.rocService.deleteUser('roc_admin', this.deleteId).then((res) => {
          this.generalService.showSuccess("Record Successfully Deleted!!", "")
          this.modal.close();

        }, err => {
          this.generalService.showError(err.message, "");
        });
        this.unsub$[++this.subNum] = this.rocService.getUserByWhere('user_role', 'uid', this.deleteUserId).subscribe(res => {
          if (res.length) this.rocService.deleteUser('user_role', res[0].id)
        })
      }
    }, err => {
      this.generalService.showError(err.error.message.message, "");
    })
  }

  // open modal window
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
      footer: footer,
      // options: {'showClose':false}
    });
    // this.modal.close = this.closeModal;
  }

  // close modal window
  closeModal() {
    this.modal.close();
    if (!this.isEdit) this.rocAdminForm.reset();
    this.submitted = false
  }

  // init form
  initForm(data?: any) {
    // ^([a-zA-Z]{1,}\[a-zA-Z]{1,}'?-?[a-zA-Z]{1,}\\s?([a-zA-Z]{1,})?)"
    this.rocAdminForm = this.formBuilder.group({
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

  editForm(data: any) {
    this.rocAdminForm = this.formBuilder.group({
      fname: [(data ? data.fname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      lname: [(data ? data.lname : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
    });
  }

  // upload new file
  // onFileChanged(inputValue: any) {
  //   let file: File = inputValue.target.files[0];
  //   let reader: FileReader = new FileReader();

  //   reader.onloadend = () => {
  //     this.currentAvatar = reader.result;
  //   };
  //   reader.readAsDataURL(file);
  // }

  // edit appointment
  edit(row: any) {
    this.openModal(this.modalBody, 'Edit ROC Admin', this.modalFooter, row);
  }

  // remove appointment
  remove(tableRow: any) {
    this.openModalDelete("You want to delete user?", "Are you sure?", this.modalDelete, tableRow)
  }

  // add new ROC
  addRocAdmin(value) {
    this.submitted = true;
    if (this.isEdit) {
      if (this.rocAdminForm.invalid) {
        return;
      } else {

        var dataObj = {
          "fname": value.fname,
          "lname": value.lname,
          "updated_at": new Date(),
        }
        this.rocService.updateUser('roc_admin', dataObj, this.editId).then((res) => {
          this.generalService.showSuccess("Record Successfully Updated!!", "")
          this.closeModal();

        }, (err) => {
          console.log("ERR::", err)
          this.generalService.showError(err.message, "");

        })
      }

    } else {
      if (this.rocAdminForm.invalid) {
        return;
      }
      else {
        var rolesObj = this.roles && this.roles.find(c => c.label == "roc-admin");
        value['role'] = rolesObj;
        value['created_by'] = this.currentUser[0];
        value.auth_token = null;
        value.facebook_authentication = null;
        value.google_authentication = null;
        value.is_deleted = false;
        value.updated_at = null;
        // console.log("Form Value:", value)
        // return
        this.rocService.createNewUser('roc_admin', value)
          .then((res => {
            this.generalService.showSuccess("ROC Admin Successfully Added!!", "")
            this.closeModal();
          }), err => {
            console.log(err)
            this.generalService.showError(err.message, "");
          })

      }
    }

  }

  get f() { return this.rocAdminForm.controls; }

}

