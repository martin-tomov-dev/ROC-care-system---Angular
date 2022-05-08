import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TCModalService } from 'src/app/ui/services/modal/modal.service';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  passwordForm: FormGroup;
  submitted = false;
  mode: any;
  passmatch = true;
  @ViewChild('modalFooter', { static: true }) modalFooter: any;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public generalService: GeneralService,
    public router: Router,
    public fireStore: AngularFirestore,
    private activatedActivated: ActivatedRoute,
    public modal: TCModalService,
    public rocService: RocadminService

  ) {
    this.mode = this.activatedActivated.snapshot.queryParams['mode'];
    if(this.mode == 'verifyEmail') {
      this.router.navigate(['sign-in'])
    }
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      pass: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      conf_pass: ['', Validators.required]
    },
    { 
      validator: this.rocService.ConfirmedValidator('pass','conf_pass')
    });
  }

  get f() { return this.passwordForm.controls; }

  submit(value) {
    this.submitted = true;
    if (this.passwordForm.invalid) {
      return;
    }
    else{
    const code = this.activatedActivated.snapshot.queryParams['oobCode'];
    this.authService.changePassword(code, value.pass)
      .then((res) => {
        this.generalService.showSuccess('Your password has been changed successfully !!','')
        this.router.navigate(['sign-in']);
      })
      .catch(err => {
        console.log(err);
      });
    }
  }

  closeModal() {
    this.modal.close();
  }

}
