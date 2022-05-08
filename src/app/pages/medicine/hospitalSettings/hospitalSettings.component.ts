import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BasePageComponent } from '../../base-page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { TCModalService } from '../../../ui/services/modal/modal.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hospitalSettings',
  templateUrl: './hospitalSettings.component.html',
  styleUrls: ['./hospitalSettings.component.scss']
})
export class HospitalSettingsComponent extends BasePageComponent implements OnInit, OnDestroy {
  hosId;
  settingdata: any;
  settingForm: FormGroup;
  submitted1 = false;
  is_edit = false;
  editID;
  unsub$: Subscription[] = [];
  subNum: number = 0;

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
    this.unsub$[++this.subNum] = this.route.queryParams.subscribe(params => {
      this.hosId = params['hid'];
    })
    this.pageData = {
      title: 'Hospital Settings',
      breadcrumbs: [
        {
          title: 'ROC',
          route: '/default-dashboard'
        },
        {
          title: 'Hospital',
          route: '/hospitals'
        },
        {
          title: 'Hospital settings',
        }
      ]
    };
  }

  ngOnInit() {
    super.ngOnInit();
    this.unsub$[++this.subNum] = this.rocService.getUserByWhere('hospital_settings', 'hospital_id', this.hosId).subscribe((res) => {
      if (res && res.length > 0) {
        this.settingdata = res[0];
        this.is_edit = true
        this.editID = res[0].id
        this.loadedDetect();
      }
      else {
        this.settingdata = [];
        this.loadedDetect();
      }
    });

  }

  loadedDetect() {
    this.setLoaded();
    this.initSettingForm(this.settingdata);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }
  initSettingForm(data?: any) {
    this.settingForm = this.fb.group({
      currency: [(data ? data.currency : ''), Validators.required],
      movingavg: [(data ? data.movingavg : ''), Validators.required]
    });
  }

  saveButton(value) {
    this.submitted1 = true;

    if (this.settingForm.valid) {

      if (this.is_edit) {
        let dataObj = {
          "currency": value.currency,
          "movingavg": value.movingavg,
          "updated_At": new Date().getTime(),
        }
        this.rocService.updateUser('hospital_settings', dataObj, this.editID).then(r => {
          this.generalService.showSuccess("Settings updated for the hospital", '')
        })
      }
      else {
        let dataObj = {
          "currency": value.currency,
          "movingavg": value.movingavg,
          "created_At": new Date().getTime(),
          "is_active": true,
          "hospital_id": this.hosId
        }
        this.rocService.addRecord('hospital_settings', dataObj).then(r => {
          if (r) this.generalService.showSuccess("Settings updated for the hospital", '')
        })
      }
      this.router.navigate(['/hospitals'])
    }
    else {
      return;
    }
  }

  get f() { return this.settingForm.controls; }

}
