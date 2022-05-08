import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../../services/http/http.service';
import { AngularFireAuth } from "@angular/fire/auth";
import { AuthService } from "../../../services/auth/auth.service";
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnInit,OnDestroy {
  notifications: any[];
  messages: any[];
  files: any[];
  closeDropdown: EventEmitter<boolean>;
  @Input() layout: string;
  userRole: any;
  currUserRole: any;
  priorityData: any[] = [];
  patients: any[] = [];
  carehomeData: any[] = [];
  carerData: any[] = [];
  modified = [];
  unsubscribePT: Subscription;
  unsub$: Subscription[] = new Array(5);

  constructor(
    private httpSv: HttpService,
    private router: Router,
    private af: AngularFireAuth,
    private authService: AuthService,
    private rocService: RocadminService,
    public translate: TranslateService

  ) {
    this.notifications = [];
    this.messages = [];
    this.files = [];
    this.closeDropdown = new EventEmitter<boolean>();
    this.layout = 'vertical';
    this.unsub$[0] = this.rocService.getPriorityState().subscribe((r) => {
      if (r) this.ngOnInit();
    })
  }

  ngOnInit() {
    this.unsub$[1] = this.rocService.getUserRole().subscribe((res) => {
      if (res) {
        this.userRole = res;
        this.currUserRole = this.userRole && this.userRole[0].role['label'];
        if (this.currUserRole === 'carehome-manager') {
          this.unsub$[2] = this.rocService.getPatientByIdRole('carehome_manager', 'user.uid').subscribe(ress => {
            if (ress) {
              this.carehomeData = ress;
              this.getPatient('patients', 'setLoaded');
            }
          })
        }
        if (this.currUserRole === 'nurse') {
          this.unsub$[2] = this.rocService.getPatientByIdRole('carers', 'user.uid').subscribe(ress => {
            if (ress) {
              this.carerData = ress;
              this.getPatient('patients', 'setLoaded');
            }
          })
        }
        // this.getData('assets/data/navbar-messages.json', 'messages');
        // this.getData('assets/data/navbar-files.json', 'files');
      }
    })
  }

  check() {
    var x = document.getElementById("myDIV");
    if(x) x.style.display = "none";
  }

  getData(url: string, dataName: string) {
    this.unsub$[3] = this.httpSv.getData(url).subscribe(
      data => {
        this[dataName] = data;
      },
      err => {
        console.log(err);
      }
    );
  }

  onCloseDropdown() {
    this.closeDropdown.emit(true);
  }

  goTo(event: Event, link: string, layout: string = '') {
    event.preventDefault();
    this.onCloseDropdown();
    setTimeout(() => {
      this.router.navigate([link]);
    });
  }
  logout(event: Event) {
    event.preventDefault();
    // localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('currentuser')

    this.onCloseDropdown();
    setTimeout(() => {
      this.router.navigate(['/sign-in'])
    });
  } 
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  getPatient(dataName: string, callbackFnName?: string, hospitalId?: string) {
    console.log("Get patient from action")
    let func;
    let refAry = ['hospital', 'care_home', 'carer_id']
    if (this.currUserRole == 'carehome-manager') {
      func = this.rocService.getUserByWhereRef(dataName, 'care_home', this.carehomeData[0].id, 'carehome_manager', refAry)
    } if (this.currUserRole == 'nurse') {
      func = this.rocService.getUserByWhereRef(dataName, 'carer_id', this.carerData[0].id, 'carers', refAry)
    }
    this.unsubscribePT = func.subscribe(
      data => {
        if (data) {
          this.priorityData = [];
          this[dataName] = data;
          let arrayFilter = this.patients.filter((x: any) => {
            return x.is_active == true
          })
          this[dataName] = arrayFilter;
          //getting prority time for pt
          // console.log('this.patients', this.patients);
          this.patients.map((x: any) => {
            x.dob = new Date(x.dob.seconds * 1000);
          });
          this.patients.sort((a: any, b: any) => b.created_at -a.created_at);
          this.patients.forEach((x) => {
            this.unsub$[4] = this.rocService.getUserById('patient_level', x.patient_level['value']).subscribe((r: any) => {
              if (r) {
                
                if(r.ass_time!=0) {
                  this.rocService.dueAssessmentCount = 0;
                  x.priority_time = r.ass_time
                  
                  this.priorityDate(x)
                }
                
              }
            })
          });

          (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
        }
      },
      err => console.log(err)
    );
  }
  
  priorityDate(pt) {
    let curr_hr = new Date().getTime()
    let last_hr = (pt.both_time['last_assessment']) ? (pt.both_time['last_assessment']) : (pt.both_time['last_updated']);
    let diff = (curr_hr - last_hr) / 1000;
    diff /= (60 * 60);
    let totalHr = Math.abs(Math.round(diff));
    // console.log("Total hr::",totalHr)
    if (totalHr >= pt['priority_time']) {
      this.priorityData.push(pt)
      // console.log('this.priorityData',this.priorityData);
      
      this.modified = this.priorityData.map(obj => ({
        created_at: obj.created_at,
        patient: obj.fname,
        msg: "'s assessment is Due",
        icon: "icofont-prescription"
      }))
      
      const key = "created_at";
      const arrayUniqueByKey = [...new Map(this.modified.map(item =>
        [item[key], item])).values()];
      
      this.notifications = arrayUniqueByKey;
      this.rocService.dueAssessment.next(arrayUniqueByKey.length);
      // console.log('this.modified',arrayUniqueByKey);
      
      // if(this.rocService.dueAssessmentCount==0)
      this.rocService.dueAssessmentCount = arrayUniqueByKey.length;
    }
  }
  ngOnDestroy() {
   if(this.unsubscribePT) this.unsubscribePT.unsubscribe();
   for (let index = 0; index < this.unsub$.length; index++) {
    if(this.unsub$[index]) this.unsub$[index].unsubscribe();
   }
  }

}
