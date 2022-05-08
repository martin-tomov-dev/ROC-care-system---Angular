import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tooltips',
  templateUrl: './tooltips.component.html',
  styleUrls: ['./tooltips.component.scss']
})
export class TooltipsComponent implements OnInit {
  tooltips = [];
  tooltipsForm = new FormGroup({})
  submitted = false;
  getData = [];
  unsub$: Subscription;
  ttId;
  constructor(
    public fb: FormBuilder,
    private rocService: RocadminService,
    private generalService: GeneralService
  ) { }

  ngOnInit(): void {
    this.tooltips = [
      { "name": "ROC to Drink swallow Green", "value": "roc_drink_swallow_green" },
      { "name": "ROC to Drink swallow Orange", "value": "roc_drink_swallow_orange" },
      { "name": "ROC to Drink swallow Red", "value": "roc_drink_swallow_red" },
      { "name": "ROC to Drink Assist Green", "value": "roc_drink_assist_green" },
      { "name": "ROC to Drink Assist Orange", "value": "roc_drink_assist_orange" },
      { "name": "ROC to Drink Assist Red", "value": "roc_drink_assist_red" },
      { "name": "ROC to Drink Encourage Green", "value": "roc_drink_encourage_green" },
      { "name": "ROC to Drink Encourage Orange", "value": "roc_drink_encourage_orange" },
      { "name": "ROC to Drink Encourage Red", "value": "roc_drink_encourage_red" },

      { "name": "ROC to Eat swallow Green", "value": "roc_eat_swallow_green" },
      { "name": "ROC to Eat swallow Orange", "value": "roc_eat_swallow_orange" },
      { "name": "ROC to Eat swallow Red", "value": "roc_eat_swallow_red" },
      { "name": "ROC to Eat Assist Green", "value": "roc_eat_assist_green" },
      { "name": "ROC to Eat Assist Orange", "value": "roc_eat_assist_orange" },
      { "name": "ROC to Eat Assist Red", "value": "roc_eat_assist_red" },
      { "name": "ROC to Eat Encourage Green", "value": "roc_eat_encourage_green" },
      { "name": "ROC to Eat Encourage Orange", "value": "roc_eat_encourage_orange" },
      { "name": "ROC to Eat Encourage Red", "value": "roc_eat_encourage_red" },

      { "name": "ROC to Holistic Hearing Green", "value": "roc_holistic_hearing_green" },
      { "name": "ROC to Holistic Hearing Orange", "value": "roc_holistic_hearing_orange" },
      { "name": "ROC to Holistic Hearing Red", "value": "roc_holistic_hearing_red" },
      { "name": "ROC to Holistic Vision Green", "value": "roc_holistic_vision_green" },
      { "name": "ROC to Holistic Vision Orange", "value": "roc_holistic_vision_orange" },
      { "name": "ROC to Holistic Vision Red", "value": "roc_holistic_vision_red" },
      { "name": "ROC to Holistic Speech Green", "value": "roc_holistic_speech_green" },
      { "name": "ROC to Holistic Speech Orange", "value": "roc_holistic_speech_orange" },
      { "name": "ROC to Holistic Speech Red", "value": "roc_holistic_speech_red" },
      { "name": "ROC to Holistic Recognition Green", "value": "roc_holistic_recognition_green" },
      { "name": "ROC to Holistic Recognition Orange", "value": "roc_holistic_recognition_orange" },
      { "name": "ROC to Holistic Recognition Red", "value": "roc_holistic_recognition_red" },
    ];
    this.getToolTips()
    this.initForm()
  }

  getToolTips() {
    this.unsub$ = this.rocService.getUser('tooltips').subscribe(res => {
      if (res && res.length) {
        this.getData = res[0];
        this.ttId = res[0].id
        this.initForm(this.getData)
      }
    })
  }

  ngOnDestroy() {
    if (this.unsub$) {
      this.unsub$.unsubscribe();
    }
  }
  
  initForm(data?: any) {
    if (data) {
      delete data.id;
      let obj = {}
      for (const key in data) {
        obj[key] = [data[key], Validators.required]
      }
      this.tooltipsForm = this.fb.group(obj)

    } else {
      let obj = {}
      this.tooltips.map(x => {
        obj[x.value] = ['', Validators.required]
      })
      this.tooltipsForm = this.fb.group(obj)
    }
  }

  get f() { return this.tooltipsForm.controls; }

  submit() {
    this.submitted = true;
    if (this.tooltipsForm.invalid) {
      return;
    }
    else {
      if (this.ttId) {
        this.rocService.updateUser('tooltips',this.tooltipsForm.value , this.ttId).then(res => {
          this.generalService.showSuccess("Tooltips successfully updated!", '')
        }, err => { console.log("Err:", err) })
      }
      else {
        this.rocService.addRecord('tooltips', this.tooltipsForm.value).then(res => {
          this.generalService.showSuccess("Tooltips successfully Added!", '')
        }, err => { console.log("Err:", err) })
      }
    }
  }

}
