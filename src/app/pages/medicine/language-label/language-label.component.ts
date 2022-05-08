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
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-label',
  templateUrl: './language-label.component.html',
  styleUrls: ['./language-label.component.scss']
})
export class LanguageLabelComponent extends BasePageComponent implements OnInit, OnDestroy {

  labelData: any = [];
  collData = [];
  langId;
  unsub$: Subscription[] = [];
  subNum: number = 0;
  // languageLabelForm:FormGroup
  languageLabelForm = new FormGroup({})

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    private route: ActivatedRoute,
    public router: Router,
    public translate: TranslateService
  ) {
    super(store, httpSv);
    // this.pageData = {
    //   title: 'Language Label',
    //   breadcrumbs: [
    //     {
    //       title: 'ROC',
    //       route: '/default-dashboard'
    //     },
    //     {
    //       title: 'Language Label',
    //       route: '/language-label'
    //     }
    //   ]
    // };
  }


  ngOnInit() {
    super.ngOnInit();
    this.loadedDetect();
    this.getLabel('assets/data/language-label.json', 'labelData', 'setLoaded');
  }

  loadedDetect() {
    this.setLoaded();
  }

  getLabel(url: string, dataName: string, callbackFnName?: string) {
    // console.log("calling JSON data")
    this.unsub$[++this.subNum] = this.httpSv.getData(url).subscribe(
      data => {
        this[dataName] = data;
        this.getLangValue('language_label')
        // this.initForm();
        // console.log('language data',this[dataName])
      },
      err => {
        console.log(err);
      },
      () => {
        (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
      }
    );
    
  }

  getLangValue(coll: string, callbackFnName?: string) {
    // console.log("calling value from db")
    this.unsub$[++this.subNum] = this.rocService.getUser(coll).subscribe(res => {
      // console.log("RESS:", res[0].language)
      this.collData = res;

      if (res && res.length > 0) {
        this.initForm(res[0].language);
        this.langId = res[0].id
      }
    })


  }

  initForm(data?: any) {
    // console.log("data from database::", data)
    // console.log("data from json::", this.labelData)
    this.labelData.filter(ld => ld.key).some(ki => {
      // console.log('ki',ki)
      let index = data.findIndex(d => d.language_key == ki.key);
      if (index != -1) {
        this.languageLabelForm.addControl(data[index].language_key, new FormControl(data[index].value, Validators.required));
      } else {
        this.languageLabelForm.addControl(ki.key, new FormControl('', Validators.required));
      }
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  updateLabel(value) {
    // console.log("id", this.langId)
    if (this.languageLabelForm.valid) {
      let data = {}
      data['language'] = [];
      this.labelData.forEach((el, i) => {
        data['language'].push({
          id: i + 1,
          language_label: el.label,
          language_key: el.key,
          value: value[el.key]
        })
 

      })
      if (this.langId) {
        this.rocService.updateUser('language_label', data, this.langId).then(res => {
          this.generalService.showSuccess("Language Label successfully updated!", '')
        }, err => { console.log("Err:", err) })
      }
      else {
        this.rocService.addRecord('language_label', data).then(res => {
          this.generalService.showSuccess("Language Label successfully updated!", '')
        }, err => { console.log("Err:", err) })
      }
      this.translate.setTranslation('en', this.translate.getTranslation('en'))

    }
    else {
      this.generalService.showError("Each fields are required", '')
      return;
    }
  }
}
