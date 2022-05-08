import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BasePageComponent } from '../../../pages/base-page'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../interfaces/app-state';
import { HttpService } from '../../../services/http/http.service';
import { TCModalService } from '../../../ui/services/modal/modal.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { createOfflineCompileUrlResolver } from '@angular/compiler';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settingdata: any;
  settingForm: FormGroup;
  submitted1 = false;
  isEdit = false;
  editId;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    private route: ActivatedRoute,
    public router: Router
  ) {
  }

  ngOnInit() {
    this.rocService.getUser('rocAdmin_settings').subscribe((res) => {
      if (res && res.length) {
        this.settingdata = res[0];
        // console.log('this.settingdata ', this.settingdata)
        this.loadedDetect()
        this.isEdit = true;
        this.editId = res[0].id;
      }
      else {
        this.settingdata = [];
        this.loadedDetect()
      }
    })
  }

  loadedDetect() {
    this.initSettingForm(this.settingdata);
  }

  initSettingForm(data?: any) {
    this.settingForm = this.fb.group({
      living_wage: [(data ? data.living_wage : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      greenVal: [(data ? data.greenVal : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      orangeVal: [(data ? data.orangeVal : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      redVal: [(data ? data.redVal : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      // num_hospital: [(data ? data.num_hospital : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      // num_chm: [(data ? data.num_chm : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      // num_carer: [(data ? data.num_carers : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      // num_patients: [(data ? data.num_patients : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]]
      num_hospital: [(data ? data.num_hospital : ''), [Validators.required, Validators.pattern("^(?:[1-9][0-9]{2}|[1-9][0-9]|[1-9])$")]],
      num_chm: [(data ? data.num_chm : ''), [Validators.required, Validators.pattern("^(?:[1-9][0-9]{2}|[1-9][0-9]|[1-9])$")]],
      num_carer: [(data ? data.num_carers : ''), [Validators.required, Validators.pattern("^(?:[1-9][0-9]{2}|[1-9][0-9]|[1-9])$")]],
      num_patients: [(data ? data.num_patients : ''), [Validators.required, Validators.pattern("^(?:[1-9][0-9]{3}|[1-9][0-9]{2}|[1-9][0-9]|[1-9])$")]],

      full: [(data ? data.full : ''), [Validators.required, Validators.pattern("^[0-9\+]{1,4}$")]],
      half: [(data ? data.half : ''), [Validators.required, Validators.pattern("^[0-9\+]{1,4}$")]],
      threeforth: [(data ? data.threeforth : ''), [Validators.required, Validators.pattern("^[0-9\+]{1,4}$")]],
      oneThird: [(data ? data.oneThird : ''), [Validators.required, Validators.pattern("^[0-9\+]{1,4}$")]],
      few_sips: [(data ? data.few_sips : ''), [Validators.required, Validators.pattern("^[0-9\+]{1,4}$")]],
      totalBar: [(data ? data.totalBar : ''), [Validators.required, Validators.pattern("^[0-9\+]{1,4}$")]],
      none: [{value: 0, disabled: true}, [Validators.required]]
    })
  }

  saveButton(value) {
    this.submitted1 = true;
    // return;
    if (this.settingForm.valid) {
      if ((value.greenVal < value.orangeVal) && (value.greenVal < value.redVal) &&
        (value.orangeVal < value.redVal)) {
        let dataObj = {
          "living_wage": value.living_wage,
          "greenVal": value.greenVal,
          "orangeVal": value.orangeVal,
          "redVal": value.redVal,
          "num_hospital": value.num_hospital,
          "num_carers": value.num_carer,
          "num_chm": value.num_chm,
          "num_patients": value.num_patients,
          "created_At": new Date().getTime(),
          "is_active": true,
          "full": +value.full,
          "half": +value.half,
          "threeforth":+value.threeforth,
          "oneThird": +value.oneThird,
          "none": 0,
          "few_sips": +value.few_sips,
          "totalBar": +value.totalBar,
        }
        if (this.isEdit) {
          this.rocService.updateUser('rocAdmin_settings', dataObj, this.editId).then((r: any) => {
            this.generalService.showSuccess("Settings updated!!", '');
            this.router.navigate(['/default-dashboard'])
          })
        } else {
          this.rocService.addRecord('rocAdmin_settings', dataObj).then(r => {
            this.generalService.showSuccess("Settings added!!", '')
            this.router.navigate(['/default-dashboard'])
          })
        }
      }
      else {
        this.generalService.showWarning("Value for Green,Orange and Red should be in ascending order", '')
      }


    }
    else {
      return;
    }
  }

  get f() { return this.settingForm.controls; }

}
