import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { Router } from '@angular/router';
import { TCModalService } from 'src/app/ui/services/modal/modal.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPwdForm: FormGroup;
  submitted = false;
  @ViewChild('modalFooter', { static: true }) modalFooter: any;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public generalService: GeneralService,
    public router: Router,
    public fireStore: AngularFirestore,
    public modal: TCModalService
  ) { }

  ngOnInit() {
    this.forgotPwdForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]]
    });
  }

  get f() { return this.forgotPwdForm.controls; }

  submit(value) {
    this.submitted = true;
    if (this.forgotPwdForm.invalid) {
      return
    }
    else {
      this.authService.forgotPassword(value.email).then(
        () => {
          this.generalService.showInfo("A password reset link has been sent to your email address",'')
        },
        (reject) => {
          this.generalService.showError(reject.message,'')
          },
      ).catch(e => {
        this.generalService.showError(e,'')
      });
    }
  }

  closeModal() {
    this.modal.close();
    this.router.navigateByUrl('/sign-in');
  }

}
