import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BasePageComponent } from '../../base-page';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { TCModalService } from '../../../ui/services/modal/modal.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roles-permission',
  templateUrl: './roles-permission.component.html',
  styleUrls: ['./roles-permission.component.scss']
})
export class RolesPermissionComponent extends BasePageComponent implements OnInit, OnDestroy {
  rolesForm: FormGroup;
  rolesData: any;
  modulesAry: any;
  actionAry: any;
  unsub$: Subscription;
  perm: any = {};
  roleId: any;
  enable = false;
  fetchData: any;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    super(store, httpSv);
    this.pageData = {
      title: 'Roles and Permission Management',
      breadcrumbs: [
        {
          title: 'ROC',
          route: '/default-dashboard'
        },
        {
          title: 'Roles and Permission management',
        }
      ]
    };
    this.modulesAry = [
      { name: 'ROC Admin', data: [] },
      { name: 'Hospital', data: [] },
      { name: 'Carehome Manage', data: [] },
      { name: 'Carers', data: [] },
      { name: 'Patients', data: [] },
      { name: 'Assessment', data: [] },
      { name: 'Patient Level', data: [] },
      { name: 'Entry Points', data: [] }
    ];

    this.actionAry = [{ id: 1, name: 'create' },
    { id: 2, name: 'view' }, { id: 3, name: 'edit' }, { id: 4, name: 'delete' }]

  }

  ngOnInit() {
    super.ngOnInit();
    this.loadedDetect();
    this.getUserRoles();
    this.initForm();
  }

  getUserRoles() {
    this.unsub$ = this.rocService.getUser('rolesTest').subscribe((r: any) => {
      if (r && r.length > 0) this.rolesData = r;
      this.rolesData.map(x => {
        x.value = x.id
      })
    })
  }

  initForm() {
    for (let index = 0; index < this.modulesAry.length; index++) {
      const element = this.modulesAry[index].name;
      this.perm[element] = [];
    }
    this.rolesForm = this.fb.group(this.perm)
  }

  loadedDetect() {
    this.setLoaded();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.unsub$) {
      this.unsub$.unsubscribe();
    }
  }

  saveButton() {
    let dataObj = {}
    dataObj['permission'] = this.perm;
    this.rocService.updateUser('rolesTest', dataObj, this.roleId).then((r: any) => {
      this.generalService.showSuccess("Permission Updated Successfully!", "");

    }, (err) => {
      console.log("ERR::", err)
      this.generalService.showError(err.message, "");
    })
  }

  onUserRoleSelect(e) {
    this.modulesAry.map(x => x.data = [])
    this.enable = true;
    this.perm = {}
    this.initForm();
    this.roleId = e.value;

    this.rolesData.find((x) => {
      if (x.id == this.roleId) this.fetchData = x;
    })
    for (const key in this.fetchData['permission']) {
      const element = this.fetchData['permission'][key]
      let ind;
      ind = this.modulesAry.findIndex(x => x.name.toLowerCase() == key.toLowerCase())
      if (ind != -1) {
        this.modulesAry[ind].data = element
        this.perm[key] = element
      }
    }
  }

  onCheckboxChange(e, mod) {
    if (e.target.checked) {
      this.perm[mod].push(e.target.value)
    } else {
      let i: number = 0;
      this.perm[mod].forEach((item: any) => {
        if (item == e.target.value) {
          this.perm[mod].splice(i, 1);
          return;
        }
        i++;
      });
    }
  }
}
