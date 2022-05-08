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
import { Subscription } from 'rxjs';
import { IAssesment } from '../../../interfaces/patient';

@Component({
  selector: 'app-patient-level',
  templateUrl: './patient-level.component.html',
  styleUrls: ['./patient-level.component.scss']
})
export class PatientLevelComponent extends BasePageComponent implements OnInit, OnDestroy {
  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted: boolean = false;
  patient_level: IAssesment[] = [];
  patientLevelForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  isEdit: boolean = false;
  editId: string;
  deleteId: string;
  unsub$: Subscription;
  // currentUser: any;
  // currentDate: any = new Date().getTime();

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    private formBuilder: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public authService: AuthService
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
          title: 'Patient Level',
          route: '/patient_level'
        }
      ]
    };
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;
  }

  ngOnInit() {
    super.ngOnInit();
    this.getPatientLevel('patient_level', 'setLoaded');
  }

  getPatientLevel(dataName: string, callbackFnName?: string) {
    this.unsub$ = this.rocService.getUser(dataName).subscribe(
      data => {
        if (data) {
          // let currentDate = new Date().getTime();
          let arrayFilter = data
          arrayFilter.sort((a, b) => b.created_at - a.created_at);
          this[dataName] = arrayFilter;
          console.log("this patient level", this.patient_level);
          (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
        }
      },
      err => console.log(err)
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.unsub$) this.unsub$.unsubscribe();
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
    this.rocService.deleteUser('patient_level', this.deleteId).then(res => {
      this.modal.close();
      this.generalService.showSuccess("Record Successfully Deleted!!", "")
    }, err => {
      this.generalService.showError(err.message, "");
    })
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
    if (!this.isEdit) this.patientLevelForm.reset();
    this.submitted = false
  }

  initForm(data?: any) {
    this.patientLevelForm = this.formBuilder.group({
      title: [(data ? data.title : ''), [Validators.required, Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z0-9\\s()-]+$")]],
      no_assessment: [(data ? data.no_assessment : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
      ass_time: [(data ? data.ass_time : ''), [Validators.required, Validators.pattern("^([0-9]|[1-9][0-9]|10)$")]],
    });
  }

  edit(row: any) {
    this.openModal(this.modalBody, 'Edit Patient Level', this.modalFooter, row);
  }

  remove(tableRow: any) {
    this.openModalDelete("You want to delete record?", "Are you sure?", this.modalDelete, tableRow)
  }

  addPatientLevel(value) {
    this.submitted = true;
    if (this.isEdit) {
      if (this.patientLevelForm.invalid) {
        return;
      } else {

        var dataObj = {
          "title": value.title,
          "no_assessment": value.no_assessment,
          "ass_time": value.ass_time,
          "updated_at": new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
        }
        this.rocService.updateUser('patient_level', dataObj, this.editId).then((res) => {
          this.closeModal();
          this.generalService.showSuccess("Record Successfully Updated!!", "")
        }, (err) => {
          console.log("ERR::", err)
          this.generalService.showError(err.message, "");

        })
      }

    }
    else {

      if (this.patientLevelForm.invalid) {
        return;
      }
      else {
        value.updated_at = null;
        value.created_at = new Date().toDateString() + ' ' + new Date().toLocaleTimeString();
        this.rocService.addRecord('patient_level', value).then((res) => {
          this.closeModal();
          this.generalService.showSuccess("Patient level Successfully Added!!", "")
        }, err => {
          this.generalService.showError(err.message, "");
        })
      }
    }

  }

  get f() { return this.patientLevelForm.controls; }

  onSwitch(event, data) {

    this.patient_level.find(pl => {
      if (pl.is_default) {
        this.rocService.updateUser('patient_level', { is_default: false }, pl.id).then((res: any) => {
        })
      } else {
        if (event == true && pl.id == data) {
          this.rocService.updateUser('patient_level', { is_default: true }, data).then((res: any) => {
            this.generalService.showSuccess("Default level updated!!", '')
          })
        }
      }
    })
  }

}
