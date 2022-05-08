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

@Component({
  selector: 'app-point-of-entry',
  templateUrl: './point-of-entry.component.html',
  styleUrls: ['./point-of-entry.component.scss']
})
export class PointOfEntryComponent extends BasePageComponent implements OnInit, OnDestroy {
  @ViewChild('modalBody', { static: true }) modalBody: ElementRef<any>;
  @ViewChild('modalFooter', { static: true }) modalFooter: ElementRef<any>;
  @ViewChild('modalDelete', { static: true }) modalDelete: ElementRef<any>;

  submitted: boolean = false;
  pointOf_entry: any[] = [];
  pointEntryForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  isEdit: boolean = false;
  unsub$: Subscription;
  editId: string;
  deleteId: string;
  // currentUser: any;
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
          title: 'Point of Entry',
          route:'/point_of_entry'
        }
      ]
    };
    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;
   }

   ngOnInit() {
    super.ngOnInit();
    this.getEntryPointData('pointOf_entry', 'setLoaded');
  }

  getEntryPointData(dataName: string, callbackFnName?: string) {
    this.unsub$ = this.rocService.getUser(dataName).subscribe(
      data => {
        if(data){
        let arrayFilter = data
        arrayFilter.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this[dataName] = arrayFilter;
        (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
      }
      },
      err => console.log(err)
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.unsub$) {
      this.unsub$.unsubscribe();
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
    this.rocService.deleteUser('pointOf_entry', this.deleteId).then(res=>{
      this.modal.close();
      this.generalService.showSuccess("Record Successfully Deleted!!", "")
    },err=>{
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
    if(!this.isEdit) this.pointEntryForm.reset();
    this.submitted = false
  }

  initForm(data?: any) {
    this.pointEntryForm = this.formBuilder.group({
      entry_from: [(data ? data.entry_from : ''), [Validators.required,Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z0-9\\s()-]+$")]],
    });
  }

  edit(row: any) {
    this.openModal(this.modalBody, 'Edit Point of Entry', this.modalFooter, row);
  }

  remove(tableRow: any) {
    this.openModalDelete("You want to delete record?", "Are you sure?", this.modalDelete, tableRow)
  }

  addEntryPoint(value) {
    this.submitted = true;
    if (this.isEdit) {
      if (this.pointEntryForm.invalid) {
        return;
      } else {

        var dataObj = {
          "entry_from": value.entry_from,
          "updated_at":new Date().toDateString() + ' '+ new Date().toLocaleTimeString()
        }
        this.rocService.updateUser('pointOf_entry', dataObj, this.editId).then((res) => {
          this.closeModal(); 
          this.generalService.showSuccess("Record Successfully Updated!!", "")
        }, (err) => {
          console.log("ERR::", err)
          this.generalService.showError(err.message, "");

        })
      }

    } 
    else {
    
      if (this.pointEntryForm.invalid) {
        return;
      }
      else {
        value.updated_at = null;
        value.created_at = new Date().toDateString() + ' '+ new Date().toLocaleTimeString()
        this.rocService.addRecord('pointOf_entry',value).then((res)=>{
          this.closeModal();
          this.generalService.showSuccess("Entry point Successfully Added!!", "")
        },err=>{
          this.generalService.showError(err.message, "");
        })
      }
    }

  }

  get f() { return this.pointEntryForm.controls; }


}
