import { Component, OnDestroy, OnInit } from '@angular/core';
import { BasePageComponent } from '../../../base-page';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../../interfaces/app-state';
import { HttpService } from '../../../../services/http/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IOption } from '../../../../ui/interfaces/option';
import { AuthService } from '../../../../services/auth/auth.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { Router, ActivatedRoute } from '@angular/router';
import firebase from 'firebase';
import { Subscription } from "rxjs";

@Component({
  selector: 'page-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss']
})
export class PageEditAccountComponent extends BasePageComponent implements OnInit, OnDestroy {
  userInfo: any;
  userForm: FormGroup;
  changePassForm: FormGroup;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  changes: boolean;
  unsub$: Subscription[] = [];
  subNum: number = 0;
  currentUser: any;
  currentRole;
  collectionName;
  editId;
  submitted = false;
  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public router:Router,
    private activatedActivated: ActivatedRoute,

  ) {
    super(store, httpSv);

    this.pageData = {
      title: 'Edit account',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Apps',
          route: 'default-dashboard'
        },
        {
          title: 'Service pages',
          route: 'default-dashboard'
        },
        {
          title: 'Edit account'
        }
      ]
    };

    this.defaultAvatar = 'assets/content/anonymous-400.jpg';
    this.currentAvatar = this.defaultAvatar;
    this.changes = false;
  }

  ngOnInit() {

    super.ngOnInit();
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res) => {
      if(res && res.length){
      this.currentUser = res
      this.currentRole = this.currentUser[0].role['label']
      if (this.currentRole == 'roc-admin') {
        this.getUserData('roc_admin', 'loadedDetect')
        this.collectionName = 'roc_admin';
      }
      else if (this.currentRole == 'carehome-manager') {
        this.getUserData('carehome_manager', 'loadedDetect')
        this.collectionName = 'carehome_manager';
      }
      else if (this.currentRole == 'nurse') {
        this.getUserData('carers', 'loadedDetect')
        this.collectionName = 'carers';
      }
      else {
        console.log("SUPER ADMIN")
        this.getUserData('user_role', 'loadedDetect')
        this.collectionName = 'user_role';
      }
    }
    })
  
  }
  get f() { return this.changePassForm.controls; }
  getUserData(dataName: string, callbackFnName?: string) {
    this.unsub$[++this.subNum] = this.rocService.getUserByWhere(dataName, 'user.uid', this.currentUser[0].uid).subscribe((res) => {
      if(res && res.length){
        this.userInfo = res[0]
        this.loadedDetect();
      }
    }, err => {
      console.log("Err", err)
    })
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  loadedDetect() {
    this.setLoaded();

    this.currentAvatar = this.defaultAvatar;
    this.inituserForm(this.userInfo);
  }
  
  // init form
  inituserForm(data: any) {
    if(data) this.editId = data.id;
    this.userForm = this.formBuilder.group({
      // img: [this.currentAvatar],
      fname: [(data?data.fname:''), Validators.required],
      lname: [(data?data.lname:''), Validators.required],
      email: [(data?data.user['email']:'test@gmail.com'), Validators.required]
    });

    //change pw form
    this.changePassForm = this.formBuilder.group({
      curr_pw: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      cpass: ['', Validators.required]
    },{
      validator: this.rocService.ConfirmedValidator('password', 'cpass')
    });

    // detect form changes
    this.unsub$[++this.subNum] = this.userForm.valueChanges.subscribe(() => {
      this.changes = true;
    });
  }
  
  // save form data
  saveData(value) {
    if (this.userForm.valid) {
      let dataObj = {
        "fname":value.fname,
        "lname":value.lname,
        "updated_at": new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
      }
      this.rocService.updateUser(this.collectionName, dataObj,this.editId).then((res) => {
        this.generalService.showSuccess("Profile Updated Successfully!", "");
        this.router.navigate(['default-dashboard'])
      }, (err) => {
        console.log("ERR::", err)
        this.generalService.showError(err.message, "");
      })
      this.changes = false; 
    }
  }

  // upload new file
  onFileChanged(inputValue: any) {
    let file: File = inputValue.target.files[0];
    let reader: FileReader = new FileReader();

    reader.onloadend = () => {
      this.currentAvatar = reader.result;
      this.changes = true;
    };

    reader.readAsDataURL(file);
  }

  changePass(value) {
    this.submitted = true;
    // console.log('firebase.auth().currentUser.uid', firebase.auth().currentUser.email);
    const userEmail = firebase.auth().currentUser.email;
    // console.log('this.collectionName',this.collectionName);
    // console.log('this.editId',this.editId);
    // console.log('value',value);
    if (this.changePassForm.invalid) {
      return;
    }
    if (this.changePassForm.valid) {
      return new Promise<any>((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(userEmail, value.curr_pw)
        .then(res => {
            resolve(res)
            var dataObj = {
              "password" : value.password
            }
            this.authService.updatePassword('carers', dataObj, this.editId).then((res) => {
              this.generalService.showSuccess("Password updated successfully", "")
              this.router.navigate(['default-dashboard'])
            }, (err) => {
              this.generalService.showError(err.message, "");
      
            })
        }, err => reject(this.generalService.showError("Your current password does not matching", "")))
      })
      
      
      // this.rocService.checkPassword('carers',value.curr_pw,'user.uid',this.currentUser[0].uid).subscribe((user) => {
      //   console.log('user', user);
      //   if(user){
      //     console.log('user available');
          
      //   }else{
      //     console.log('user unavailable');
      //   }
      //   return;
      //   if(!user) {
      //     this.authService.updatePassword('carers', dataObj, this.editId).then((res) => {
      //       this.generalService.showSuccess(res.message, "")
      //       // this.router.navigate(['default-dashboard'])
      //     }, (err) => {
      //       this.generalService.showError(err.message, "");
    
      //     })
      //   } else {
      //     this.generalService.showError("You entered wrong current password", "");
      //   }
      // })
      
    }
    else if(value.password!=value.cpass){
      this.generalService.showError("New password and confirm new password must be same", "");
    } else {
      this.generalService.showError("Please enter current password, new password and confirm new password", "");
    }
    
    // this.authService.changePassword(code, value.pass)
    //   .then((res) => {
    //     this.generalService.showSuccess('Your password has been changed successfully !!','')
    //     this.router.navigate(['sign-in']);
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });
    // }
    // console.log('this.editId, this.collectionName',this.editId, this.collectionName);
    
    // if(this.changePassForm.valid) {
    //   this.rocService.getUserById(this.collectionName,this.editId).subscribe((res: any) => {
    //     if (res) {
    //       console.log('res', res.pwd);
          
    //     }
    //   })
    // } else if(value.password!=value.cpass){
    //   this.generalService.showError("New password and confirm new password must be same", "");
    // } else {
    //   this.generalService.showError("Please enter current password, new password and confirm new password", "");
    // }
  }
}
