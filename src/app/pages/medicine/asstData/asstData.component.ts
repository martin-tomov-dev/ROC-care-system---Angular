import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BasePageComponent } from "../../base-page";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NavigationExtras, Router, ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { IAppState } from "../../../interfaces/app-state";
import { HttpService } from "../../../services/http/http.service";
import { TCModalService } from "../../../ui/services/modal/modal.service";
import { RocadminService } from "src/app/services/generalService/rocadmin.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { Subscription } from "rxjs";
import { last } from "rxjs/operators";
import { newArray } from "@angular/compiler/src/util";
import { async } from "q";
import * as _ from "lodash";
import { IDueData } from "src/app/interfaces/dashboard";
import { IAssesment, IPatient, ICarehomeData, ICurrentUser } from "src/app/interfaces/patient";

@Component({
  selector: "app-asstData",
  templateUrl: "./asstData.component.html",
  styleUrls: ["./asstData.component.scss"],
})
export class AsstDataComponent
  extends BasePageComponent
  implements OnInit, OnDestroy
{
  @ViewChild("staticTabs", { static: true }) staticTabs: TabsetComponent;
  dueData: IDueData[] = [];
  // completedData: any[] = [];
  lastData: IDueData[] = [];
  priorityData: IDueData[] = [];

  patientsLevel: IAssesment[];
  unsub$: Subscription[] = [];
  subNum: number = 0;
  patients: IPatient[] = [];
  // roles: any[] = [];
  carehomeData: ICarehomeData[] = [];
  carerData: ICarehomeData[] = [];
  currentUser: ICurrentUser[] = [];
  currentRole: string;
  checkMsg: boolean = false;
  patientUnsubscribe: Subscription;
  // eatDue:boolean
  // assessmentData: any[] = [];
  asmtLogs: any[] = [];

  drinkLogs: any[] = [];
  eatLogs: any[] = [];
  holisticLogs: any[] = [];
  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    private formBuilder: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(store, httpSv);
    this.pageData = {
      title: "Assessment Data",
      breadcrumbs: [
        {
          title: "ROC",
          route: "/default-dashboard",
        },
        {
          title: "Assessment data",
          route: "/assessment-data",
        },
      ],
    };
  }

  ngOnInit() {
    // super.ngOnInit();
    localStorage.removeItem("patientClick");
    this.unsub$[++this.subNum] = this.activatedRoute.queryParams.subscribe(
      (params) => {
        if (params["tab"]) {
          this.staticTabs.tabs[0].active = true;
        }
      }
    );
    // this.getData('assets/data/appointments.json', 'appointments', 'setLoaded');
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe(
      (res: ICurrentUser[]) => {
        if (res && res.length) {
          this.currentUser = res;
          this.currentRole = this.currentUser[0].role["label"];

          if (this.currentRole === "carehome-manager") {
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("carehome_manager", "user.uid")
              .subscribe((res) => {
                if (res) {
                  this.carehomeData = res;
                  this.getPatient("patients", "setLoaded");
                }
              });
          } else if (this.currentRole === "nurse") {
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("carers", "user.uid")
              .subscribe((res) => {
                if (res) {
                  this.carerData = res;
                  console.log("this.carerData", this.carerData);
                  this.getPatient(
                    "patients",
                    "setLoaded",
                    this.carerData[0]["hospital"].id
                  );
                }
              });
          } else {
            this.getPatient("patients", "setLoaded");
          }
          this.unsub$[++this.subNum] = this.rocService
            .getUser("patient_level")
            .subscribe((r: any) => {
              if (r && r.length > 0) {
                this.patientsLevel = [...r];
              }
              console.log("this patientlevel", this.patientsLevel);
            });
        }
      },
      (err) => {
        console.log("Err", err);
      }
    );
  }

  getPatient(dataName: string, callbackFnName?: string, hospitalId?: string) {
    console.log("this.currentRole", this.currentRole);
    let func;
    let refAry = ["hospital", "care_home", "carer_id"];
    if (hospitalId) {
      console.log("hospitalId", hospitalId);
      func = this.rocService.getUserByWhereRef(
        dataName,
        "hospital",
        hospitalId,
        "hospitals",
        refAry
      );
    } else {
      if (this.currentRole == "carehome-manager") {
        func = this.rocService.getUserByWhereRef(
          dataName,
          "care_home",
          this.carehomeData[0].id,
          "carehome_manager",
          refAry
        );
      } else if (this.currentRole == "nurse") {
        console.log("this.carerData[0].id", this.carerData[0].id);
        func = this.rocService.getUserByWhereRef(
          dataName,
          "carer_id",
          this.carerData[0].id,
          "carers",
          refAry
        );
      } else {
        func = this.rocService.getUserWithRef(dataName, [
          "care_home",
          "carer_id",
        ]);
      }
    }
    this.unsub$[++this.subNum] = this.patientUnsubscribe = func.subscribe(
      async (data) => {
        console.log("data:", data);
        if (data) {
          this.dueData = [];
          // this.completedData = []
          this.priorityData = [];
          this[dataName] = data;

          let arrayFilter = this.patients.filter((x: any) => {
            return x.is_active == true;
          });
          this[dataName] = arrayFilter;
          //getting prority time for pt
          this.patients
            .map((x: any) => {
              x.dob = new Date(x.dob.seconds * 1000);
            })
            .sort((a: any, b: any) => b.created_at - a.created_at);
          //patient for loop
          let varPt = this.patientLoop();
          // setTimeout(() => {
          // set data for due priority and last
          this.setData(varPt);
          // }, 300)

          // this.completedData.map(y => { y['lastTime'] = new Date(y.last_assessmentTime).toLocaleString() });
          callbackFnName && typeof this[callbackFnName] === "function"
            ? this[callbackFnName](this[dataName])
            : null;
        }
      },
      (err) => console.log(err)
    );
  }

  patientLoop() {
    this.patients.forEach((x, ind) => {
      // this.rocService.getUserById('patient_level', x.patient_level['value']).subscribe((r: any) => {
      this.patientsLevel.map((r) => {
        if (r && r.id == x.patient_level["value"]) {
          x.priority_time = r.ass_time;
          this.priorityDate(x);
          if (!x.eat_time) x.eat_time = 0;
          if (!x.drink_time) x.drink_time = 0;
          if (!x.holistic_time) x.holistic_time = 0;

          this.checkDue(x, "eat_time", "eatDue");
          this.checkDue(x, "drink_time", "drinkDue");
          this.checkDue(x, "holistic_time", "holisticDue");
        }
      });
    });
    console.log("this patients", this.patients)
    return this.patients;
  }

  setData(data) {
    this.lastData = data.filter((x) => {
      if (x.last_assessmentTime) return true;
    });
    this.lastData.map((x) => {
      (x["assessment"] = {
        eat: x.eat ? x.eat : "",
        drink: x.drink ? x.drink : "",
        holistic: x.holistic ? x.holistic : "",
      }),
        (x["lastTime"] = new Date(x.last_assessmentTime).toLocaleString());
    });
    console.log("this lastdata", this.lastData);
    this.lastData.sort(
      (a: any, b: any) => b.last_assessmentTime - a.last_assessmentTime
    );
    //for due and completed
    // let pd = data;
    data.filter((x, i) => {
      if (!x.msg) {
        this.dueData.push(x);
      }
    });
    console.log("due data:", this.dueData);
  }
  priorityDate(pt) {
    let curr_hr = new Date().getTime();
    let last_hr = pt.both_time["last_assessment"]
      ? pt.both_time["last_assessment"]
      : pt.both_time["last_updated"];
    let diff = (curr_hr - last_hr) / 1000;
    diff /= 60 * 60;
    let totalHr = Math.abs(diff);

    if (totalHr >= pt["priority_time"]) {
      this.priorityData.push(pt);
      this.priorityData.map((p) => {
        p["assessment"] = {
          eat: p.eat ? p.eat : "",
          drink: p.drink ? p.drink : "",
          holistic: p.holistic ? p.holistic : "",
        };
      });
      console.log("this priority", this.priorityData);
    }
  }

  checkDue(pt, last_time, dueType) {
    let curr_hr = new Date().getTime();
    let last_hr = pt[last_time];
    let diff = (curr_hr - last_hr) / 1;
    diff /= 60 * 60;
    let totalHr = Math.abs(diff);
    if (+totalHr >= +pt["priority_time"]) {
      pt[dueType] = true;
    } else {
      pt[dueType] = false;
    }
    if (pt.drinkDue == false && pt.eatDue == false && pt.holisticDue == false) {
      pt["msg"] = "No assessment due at the moment";
    }
    // else{
    //   this.dueData.push(pt)
    // }
  }

  goTo(id, type) {
    if (type === "Drink") {
      this.unsub$[++this.subNum] = this.rocService
        .getUserByWhereRef("assessment-logs", "patient_id", id, "patients")
        .subscribe((res) => {
          if (res) {
            this.asmtLogs = [...res];
            this.asmtLogs.sort((a: any, b: any) => b.created_at - a.created_at);
            this.asmtLogs.map((x) => {
              x.asmt_time = new Date(x.created_at).toLocaleString();
              x.type = x.asmt_type.replace(/_/g, " ");
            });
            let newAry = _.groupBy(this.asmtLogs, "asmt_type");
            this.drinkLogs = newAry["roc_drink"] ? newAry["roc_drink"] : [];
            console.log("asmt_type", this.asmtLogs);
            if (this.drinkLogs.length > 0) {
              console.log("if case");
              let verify = localStorage.getItem("patientClick");
              let second = localStorage.getItem("secondClick");

              //debugger
              if (!!verify || !!second) {
                this.router.navigate(["/patients"]);
              } else {
                this.router.navigate(["/hydration", id]);
              }
            } else {
              console.log("Else Case");
              const data: NavigationExtras = {
                state: {
                  patient_id: id,
                  roc_type: type,
                },
              };
              this.router.navigate(["/assessment"], data);
            }
            // if(this.drinkLogs.length == 0){
            //   console.log("IF Patient")
            //    // this.router.navigate(['/patients'])

            // } else if(this.drinkLogs.length > 1){
            //   console.log("IF Second Page")
            //      //this.router.navigate(['/hydration/',id])
            // }else{
            //   console.log("Else Case")
            //   const data: NavigationExtras = {
            //             state: {
            //                     patient_id: id,
            //                     roc_type: type
            //                    }
            //         }
            //    // this.router.navigate(['/assessment'], data)
            // }

            // console.log(this.drinkLogs)
            // let arrayFilter = this.drinkLogs.map((x: any) => {
            //   return x.asmt_time.split(' ')[0];
            // })
            // var today = new Date().toLocaleString();
            // let checkDateExitst = this.isInArray(arrayFilter,today.split(' ')[0]);
            // if(!!checkDateExitst){
            //   //console.log("If")
            //   this.router.navigate(['/hydration/',id])

            // }else{
            //   console.log("else")
            //     const data: NavigationExtras = {
            //         state: {
            //                 patient_id: id,
            //                 roc_type: type
            //                }
            //     }
            //  // this.router.navigate(['/assessment'], data)
            // }
          }
        });
    } else {
      const data: NavigationExtras = {
        state: {
          patient_id: id,
          roc_type: type,
        },
      };
      this.router.navigate(["/assessment"], data);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.patientUnsubscribe) this.patientUnsubscribe.unsubscribe();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }
  // Added By Darshan reason is compared date with Array in exits or not.

  isInArray(array, value) {
    return (
      (
        array.find((item) => {
          return item == value;
        }) || []
      ).length > 0
    );
  }
}
