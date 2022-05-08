import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AuthService} from '../../../services/auth/auth.service';
import {Router} from '@angular/router';
import { GeneralService } from 'src/app/services/generalService/general.service';
@Component({
  selector: 'register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    public authService:AuthService,
    public router:Router,
    public generalService:GeneralService
    ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required,Validators.pattern("[a-zA-Z ]*")]],
      email: ['', [Validators.required, Validators.email,Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      pass: ['', [Validators.required,Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]]
    });
  }

  get f() { return this.registerForm.controls; }

  userRegister(value){
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    else{
      this.authService.doRegister(value)
      .then(res => {
        // console.log("Registered",res);
        this.generalService.showSuccess("Successfully Registered!!", "")
        this.router.navigate(['/sign-in']);
      }, err => {
        console.log(err);
        this.generalService.showError("Registration failed","")      
      })
    }
  }
}
