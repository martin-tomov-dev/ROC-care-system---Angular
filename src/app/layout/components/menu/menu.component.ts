import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { HttpService } from '../../../services/http/http.service';
import { IMenuItem } from '../../../interfaces/main-menu';
import * as SettingsActions from '../../../store/actions/app-settings.actions';
import { IAppState } from '../../../interfaces/app-state';
import * as PageActions from '../../../store/actions/page.actions';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { TranslateService } from "@ngx-translate/core";
import { Subject, Subscription, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/internal/operators/takeUntil";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('subMenu', [
      state('active', style({
        height: '*',
        visibility: 'visible'
      })),
      state('inactive', style({
        height: 0,
        visibility: 'hidden'
      })),
      transition('inactive => active', animate('200ms ease-in-out')),
      transition('active => inactive', animate('200ms ease-in-out')),
    ]
    )]
})
export class MenuComponent implements OnInit {
  @HostBinding('class.main-menu') true;
  @HostBinding('class.horizontal') get horizontal() {
    return this.orientation === 'horizontal';
  };
  @HostBinding('class.vertical') get vertical() {
    return this.orientation === 'vertical';
  };
  @Input() orientation: string;
  @Input() src: string;
  menuItems: IMenuItem[];
  caret: string;
  userRole: any;
  actionNumbers: number = 0;
  careRolesArr = [];
  labelData: any = [];
  currentUser: any;
  currentRole;
  unsubscribePT: any;
  modelFeedback: string = "";
  disabledDate = (current: Date): boolean => {
    return new Date(current) > new Date();
  };
  acknoledgedData: any = [];
  acknoledgementDoc: any = [];
  patientInfo: any;
  loggedInManager: any;
  unsub1$: Subscription;
  unsub2$: Subscription;
  unsub3$: Subscription;
  unsub4$: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private httpSv: HttpService,
    private store: Store<IAppState>,
    private router: Router,
    public rocService: RocadminService,
    private translate: TranslateService
  ) {
    this.caret = 'icofont-thin-right';
    this.orientation = 'vertical';
    
  }

  ngOnInit() {
    this.rocService.getUserRole().subscribe(async res => {
      // if (res) {
        // console.log('menu res',res)
        this.userRole = res
        this.getLanguage('language_label')
      // }
    })
    this.unsub1$ = this.rocService.getUserRole().subscribe(
      async (res) => {
        if (res && res.length) {
          this.currentUser = res;
          this.currentRole = this.currentUser[0].role["label"];

          if (this.currentRole == "carehome-manager") {
            this.getAcknowledgementsManager(this.currentUser[0].uid);
          } else if (this.currentRole == "roc-admin") {
            this.getAcknowledgementsAdmin(this.currentUser[0].uid);
          }
          console.log("Role:::", this.currentRole);
        }
      },
      (err) => {
        console.log("Err", err);
      }
    );
  }

  getLanguage(coll) {
    this.rocService.getUser(coll).subscribe(async res => {
      // if (res) {
        // console.log("db res::",res[0].language)
        // console.log('this.src',this.src)
        this.labelData = res[0].language;
        this.getMenuData(this.src);
      // }
    })
  }

  getAcknowledgementsAdmin(uid: any): any {
    this.unsub3$ = this.rocService
      .getUserByWhereHL("roc_admin", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
        this.getAcknowledgements("roc-admin");
      });
  }
  getAcknowledgementsManager(uid: any): any {
    this.unsub3$ = this.rocService
      .getUserByWhereHL("carehome_manager", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
        this.getAcknowledgements("carehome-manager");
      });
  }
  getAcknowledgements(userType: string) {
    console.log("this currentUser", this.loggedInManager);
    this.unsub4$ = this.rocService
    .getAllwithPopWithoutField("roc_acknowledgements")
    .pipe(takeUntil(this.destroy$))
    .subscribe(async (resut: any) => {
      console.log("this resut", resut);
      const response = resut
        .sort(
          (a: any, b: any) => b.date_time_of_record - a.date_time_of_record
        )
        .map((data: any) => {
          data["date_time"] = this.transformDate(data.date_time_of_record);
          data["acknowledgedAt"] = this.transformDate(data.acknowledgedAt);
          if (data.feedback == "C" || data.feedback == "Concerned") {
            data["img"] = "assets/img/face-red.png";
          } else {
            data["img"] = "assets/img/face-amber.png";
          }
          return data;
        });
        console.log("MMMMMMMMMMMMMM", response);
        if (userType == "roc-admin") {
          let acknoledgementDoc = [];
          let acknoledgedData = [];
          response.forEach((dt) => {
            if (!dt.isAcknowledged) {
              acknoledgementDoc.push(dt);
            } else {
              acknoledgedData.push(dt);
            }
          });
          this.acknoledgementDoc = acknoledgementDoc;
          this.acknoledgedData = acknoledgedData;
        } else {
          let prList = [];
          let indexList = [];
          console.log(">>>>>>>>>>>>>>>>>>>>", response)
          response.forEach((dt, index) => {
            if(dt["patient_id"]) {
              prList.push(this.rocService.getByPathPromise(dt["patient_id"]));
              indexList.push(index);
            }
            
          });
          const resultList = await Promise.all(prList);
          let acknoledgementDoc = [];
          let acknoledgedData = [];
          resultList.forEach((item:any, index) => {
            const refData: any = this.rocService.convertPath(item);
            if(refData && refData.actualData) {
              const newItem = {
                ...response[indexList[index]],
                patient_id: refData.actualData
              }
              if (
                !newItem.isAcknowledged &&
                newItem.patient_id?.hospital?.id == this.loggedInManager.hospital.id
              ) {
                acknoledgementDoc.push(newItem);
              }
              if (
                newItem.isAcknowledged &&
                newItem.patient_id?.hospital?.id == this.loggedInManager.hospital.id
              ) {
                acknoledgedData.push(newItem);
              }
              
            }
          })

          this.acknoledgementDoc = acknoledgementDoc;
          this.acknoledgedData = acknoledgedData;
          console.log("this.acknoledgementDoc", this.acknoledgementDoc);

          // this.concernedPatients = this.acknoledgementDoc;
          this.acknoledgedData = response.filter((dt) => {
            if (
              dt.isAcknowledged &&
              dt.patient_id?.hospital?.id == this.loggedInManager.hospital.id
            ) {
              return dt;
            }
          });
        }
        
    });
  }

  transformDate(value) {
    let localDt = new Date(value).toLocaleString();
    let tempDt = localDt.split(":", 2);
    return tempDt[0] + ":" + tempDt[1];
  }

  getMenuData(url: string) {

    let currUserRole = this.userRole && this.userRole[0].role['label'];
    // return
    // console.log('role->',currUserRole);
    
    if (currUserRole == 'carehome-manager') {
      this.careRolesArr = ['ROC Admin', 'Hospitals/Care Homes', 'Care Home Manager', 
      'Point Of Entry','CHM Group', 'Patient Level'];
    }
    if (currUserRole == 'chm-group') {
      this.careRolesArr = ['ROC Admin', 'Care Home Manager', 
      'Point Of Entry','Assessment', 'Patient Level','CHM Group','Actions'];
    }

    if (currUserRole == 'nurse') {
      this.careRolesArr = ['ROC Admin', 'Hospitals/Care Homes','CHM Group', 'Care Home Manager', 'Point Of Entry', 'Patient Level', 'Carers/Nurse', 'Actions'];
    }

    if (currUserRole == 'roc-admin' || currUserRole == 'super-admin') {
      this.careRolesArr = ['Care Home Manager', 'Assessment', 'Actions']
    }

    // if (currUserRole == 'roc-admin') {
    //   this.careRolesArr = ['ROC Admin'];
    // }
    // console.log('Roles arr => ', this.careRolesArr);
    // console.log('URL => '+url);
    
    this.httpSv.getData(url).subscribe(
      data => {
        const menuData = data;
        // console.log("menuData json ==> ",data);
        const results = menuData && menuData.filter(({ title: id1 }) => 
          !this.careRolesArr.some((id2) => id2 === id1)
        );
        // console.log("Results ==> ", results);
        
        this.menuItems = results;
        console.log("menuItems", this.menuItems)
        this.menuItems.forEach((y) => {
          this.translate.get(y.title).subscribe(val => {
            // console.log('val is ',val);
            
            y.title = val
          })
        })
      },
      err => {
        console.log(err)
      }
    );
  }
  
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.unsub1$) this.unsub1$.unsubscribe();
    if (this.unsub2$) this.unsub2$.unsubscribe();
    if (this.unsub3$) this.unsub3$.unsubscribe();
    if (this.unsub4$) this.unsub4$.unsubscribe();
  }

  toggle(event: Event, item: any, el: any) {
    event.preventDefault();

    let items: any[] = el.menuItems;

    if (item.active) {
      item.active = false;
    } else {
      for (let i = 0; i < items.length; i++) {
        items[i].active = false;
      }
      item.active = true;
    }

    this.changeRoute(
      item.routing,
      !item.sub && !this.isActive([item.routing]),
      item.layout ? item.layout : this.orientation
    );
  }

  subState(item: IMenuItem, rla: boolean) {
    return item.active || rla ? 'active' : 'inactive'
  }

  closeAll() {
    this.menuItems.forEach(item => {
      item.active = false;

      this.closeSub(item);
    });
  }

  closeSub(item: IMenuItem) {
    if (item.sub && item.sub.length) {
      item.sub.forEach(subItem => {
        subItem.active = false;
      });
    }
  }

  closeSidebar() {
    this.store.dispatch(new SettingsActions.SidebarState(false));
  }

  // change route
  changeRoute(routing: string, bool: boolean = true, layout: string = this.orientation) {

    if (bool) {
      this.store.dispatch(new PageActions.Reset());

      setTimeout(() => {
        this.router.navigate([routing]);
      }, 0);
    }
  }

  isActive(instruction: any[]): boolean {
    return this.router.isActive(this.router.createUrlTree(instruction), true);
  }
}
