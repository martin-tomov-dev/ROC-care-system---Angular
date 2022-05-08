import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import {GeneralService} from 'src/app/services/generalService/general.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';



@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  submitted=false;

  currentUser: any;
  currentRole;
  carerInfo;
  clicked = false;
  constructor(
    private fb: FormBuilder,
    public authService:AuthService,
    public rocService: RocadminService,
    public generalService:GeneralService,
    public router:Router,
    public fireStore:AngularFirestore) {
      
    }

  ngOnInit() {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      pass: ['', Validators.required],
      remember_me:['']
    });

    if(localStorage.getItem('remember_me')){
      let fetchval = JSON.parse(localStorage.getItem('remember_me'))
      this.loginForm.controls.login.setValue(fetchval.login)
      this.loginForm.controls.pass.setValue(atob(fetchval.pass))
      this.loginForm.controls.remember_me.setValue(fetchval.remember_me)
    }
   
  }

  get f() { return this.loginForm.controls; }

  userLogin(value){
    
    this.submitted=true;
    if(this.loginForm.invalid){
      return
    }
    else{    
      this.clicked = true;
      document.getElementById("mainLoginLoading").style.display='block';
      this.authService.doLogin(value)
      .then((res) => {
        console.log('after login res',{res});
        if(this.submitted==true)
        this.checkPoint();
        // this.getUserData('carers',res.user.uid)

        // this.generalService.showSuccess("Logged in successfully !!", "")
        // this.router.navigate(['/default-dashboard']);
      }, err => {
        this.generalService.showError("Invalid Credentials","")
        document.getElementById("mainLoginLoading").style.display='none';
        this.submitted=false;
        this.clicked = false;
        console.log(err);
      })
    }
  }

  checkPoint(){
    localStorage.removeItem("sessionExpired");
    this.rocService.getUserRole().subscribe((res) => {
      if(res && res.length){
      this.currentUser = res
      this.currentRole = this.currentUser[0].role['label']
      console.log('this.currentRole',this.currentRole)
      if (this.currentRole == 'nurse' && this.submitted==true) {
        console.log('checkpoint if');
        
        this.getUserData('carers',this.currentUser[0].uid)
      }
      else if(this.submitted==true) {
        console.log('check point else');
        this.submitted=false;
        this.generalService.showSuccess("Logged in successfully !!", "")
        // if (this.currentRole == 'carehome-manager') {
        //   this.router.navigate(['/default-dashboard']);
        // } else {
        //   this.router.navigate(['/default-dashboard']);
        // }
        this.router.navigate(['/patients']);
        return;
      }
    }
    })
  }

  getUserData(dataName: string,uid:any) {
    this.rocService.getUserByWhereHL(dataName, 'user.uid', uid).subscribe((res) => {
      // if(res && res.length){
        this.carerInfo = res[0];
        if((!this.carerInfo.cstatus || this.carerInfo.cstatus==false) && this.submitted==true){
          this.submitted=false;
          localStorage.removeItem('token');
          localStorage.removeItem('currentuser');
          this.generalService.showInfo("Contact your administrator !!", "User Disabled!")
        } else if(this.carerInfo.cstatus==true && this.submitted==true){
            console.log('get user data');
            this.submitted=false;
            this.generalService.showSuccess("Logged in successfully !!", "")
            // this.router.navigate(['/default-dashboard']);
            this.router.navigate(['/patients']);
            return;
        }
      // }
    }, err => {
      console.log("Err", err)
    })
  }
}



// .then((resp:any)=>{
//   debugger
//   this.fireStore.collection('carers', ref => ref.where('user.uid', '==', resp.user.uid)).get().subscribe((res)=>{
//     this.carerInfo = res[0];
//     if(this.carerInfo.cstatus){
//       if(this.carerInfo?.cstatus==false && this.submitted==true){
//         this.generalService.showInfo("Contact your administrator !!", "User Disabled!")
//       }else if(this.submitted==true){
//           this.router.navigate(['/default-dashboard']);
//           this.generalService.showSuccess("Logged in successfully !!", "")
//       }
//     }else{
//       this.router.navigate(['/default-dashboard']);
//       this.generalService.showSuccess("Logged in successfully !!", "")
//       return;
//     }
//   });
// })
