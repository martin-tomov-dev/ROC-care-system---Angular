import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BasePageComponent } from "../../../base-page";
import { Store } from "@ngrx/store";
import { IAppState } from "../../../../interfaces/app-state";
import { HttpService } from "../../../../services/http/http.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IOption } from "../../../../ui/interfaces/option";
import { RocadminService } from "src/app/services/generalService/rocadmin.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import * as _ from "lodash";
import { TCModalService } from "src/app/ui/services/modal/modal.service";
import { TranslateService } from "@ngx-translate/core";
import { IPatient, IAssesment } from "src/app/interfaces/patient";
import { IMulti, IAcknoledgedData, IRole } from "src/app/interfaces/dashboard";

@Component({
  selector: "page-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class PageUserProfileComponent
  extends BasePageComponent
  implements OnInit, OnDestroy
{
  @ViewChild("modalBody", { static: true }) modalBody: ElementRef<any>;
  @ViewChild("modalBodyCHM", { static: true }) modalBodyCHM: ElementRef<any>;
  @ViewChild("modalFooter", { static: true }) modalFooter: ElementRef<any>;
  @ViewChild("modalFooterCHM", { static: true })
  modalFooterCHM: ElementRef<any>;
  @ViewChild("modalDelete", { static: true }) modalDelete: ElementRef<any>;
  totalBarValue;

  patients = null;
  assessmentData: IAssesment[] = [];
  asmtLogs: any[] = [];

  drinkLogs: IAcknoledgedData[] = [];
  eatLogs: IAcknoledgedData[] = [];
  holisticLogs: IAcknoledgedData[] = [];

  multi: IMulti[];
  // byDate: any[] = [];
  view: number[] = [600, 600];
  // filterData: [];

  unsub$: Subscription[] = [];
  subNum: number = 0;
  toastrShow: boolean = true;
  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = "Date";
  yAxisLabel: string = "Value";
  timeline: boolean = true;
  colorScheme = {
    domain: ["#5AA454", "#E44D25", "#CFC0BB", "#7aa3e5", "#a8385d", "#aae3f5"],
  };

  changes: boolean;
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  editId: string;
  status: boolean = false;

  loaded: boolean = false;
  disableDropdown: boolean = false;
  oldImgFile: any;
  downloadURL: Observable<string>;

  disabledDate = (current: Date): boolean => {
    return new Date(current) > new Date();
  };

  submitted = false;
  hydrationForm: FormGroup;
  currentRole = null;
  settingData: any = null;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public rocService: RocadminService,
    public generalService: GeneralService,
    private route: ActivatedRoute,
    public router: Router,
    public firestore: AngularFirestore,
    private storage: AngularFireStorage,
    public modal: TCModalService,
    public translate: TranslateService
  ) {
    super(store, httpSv);

    this.pageData = {
      title: "",
      breadcrumbs: [
        {
          title: "ROC",
          route: "/default-dashboard",
        },
        {
          title: "Patients",
          route: "/patients",
        },
      ],
    };
    // this.changes = false;
    this.defaultAvatar = "assets/content/avatar.jpg";
    this.currentAvatar = this.defaultAvatar;
  }
  storeInstake() {
    const patientId = this.route.snapshot.paramMap.get("id");
    this.unsub$[++this.subNum] = this.rocService
      .getUserWithRefByID("patients", patientId, [
        "hospital",
        "care_home",
        "carer_id",
      ])
      .subscribe((resdata) => {
        if (resdata && resdata['intake'] > 0) {
          let dataObj = {
            date: new Date().getTime(),
            id: patientId,
            intake: resdata['intake'],
          };
          this.rocService.addRecord("log-store-intake", dataObj).then(
            (res) => {
              // if (this.toastrShow == true) {
              //   this.toastrShow = false;
              //   this.generalService.showSuccess(
              //     "Intake value recorded successfully",
              //     ""
              //   );
              //   this.closeModal();
              // }
            },
            (err) => {
              console.log(err);
              this.generalService.showError(err.message, "");
            }
          );

        }
      });
  }
  getChartData() {
    this.multi = [
      {
        name: "Intake Value",
        series: [
          {
            name: "23/02",
            value: 3500,
          },
          {
            name: "24/02",
            value: 4000,
          },
          {
            name: "25/02",
            value: 4500,
          },
          {
            name: "26/02",
            value: 5000,
          },
          {
            name: "27/02",
            value: 5900,
          },
          {
            name: "28/02",
            value: 3500,
          },
          {
            name: "01/03",
            value: 8500,
          },
        ],
      },
    ];
    // this.rocService.getUser("log-store-intake").subscribe((res) => {
    //   console.log("getchartdata")
    //   if (res && res.length) {
    //     let dateObj = new Date();
    //     let month = dateObj.getUTCMonth() + 1; //months from 1-12
    //     let day = dateObj.getUTCDate();
    //     let year = dateObj.getUTCFullYear();
    //     new Date().toISOString();
    //     //"2016-02-18T23:59:48.039Z"
    //     new Date().toISOString().split("T")[0];
    //     //"2016-02-18"
    //     new Date()
    //       .toISOString()
    //       .replace("-", "/")
    //       .split("T")[0]
    //       .replace("-", "/");
    //     //"2016/02/18"

    //     new Date().toLocaleString().split(",")[0];
    //     //"2/18/2016"
    //    // if (res.length > 6) {
    //       this.multi = [
    //         {
    //           name: "Intake Value",
    //           series: [
    //             {
    //               name: "23/02",
    //               value: 3500,
    //             },
    //             {
    //               name: "24/02",
    //               value: 4000,
    //             },
    //             {
    //               name: "25/02",
    //               value: 4500,
    //             },
    //             {
    //               name: "26/02",
    //               value: 5000,
    //             },
    //             {
    //               name: "27/02",
    //               value: 5900,
    //             },
    //             {
    //               name: "28/02",
    //               value: 3500,
    //             },
    //             {
    //               name: "01/03",
    //               value: 8500,
    //             },
    //           ],
    //         },
    //       ];
    //    // }
    //   }
    // });
  }
  transformDate(value) {
    let localDt = new Date(value).toLocaleString();
    let tempDt = localDt.split(":", 2);
    return tempDt[0] + ":" + tempDt[1];
  }
  ngOnInit() {
    // this.storeInstake();
    // this.getChartData();
    super.ngOnInit();
    this.getPatientLeveldata("patient_level");
    this.editId = this.route.snapshot.paramMap.get("id");
    this.unsub$[++this.subNum] = this.rocService
      .getUserWithRefByID("patients", this.editId, [
        "hospital",
        "care_home",
        "carer_id",
      ])
      .subscribe((res: IPatient[]) => {
        if (res) {
          this.patients = res;
          console.log("this.patients ", this.patients);
          this.patients["birthDate"] = new Date(
            this.patients["dob"].seconds * 1000
          ).toLocaleDateString();
          this.loadedDetect();
        }
      });
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe((res: IRole[]) => {
      if (res && res.length) {
        this.currentRole = res;
        this.currentRole = this.currentRole[0].role["label"];
        console.log("this.currentRole ", this.currentRole, res);
      }
    });
    this.unsub$[++this.subNum] = this.rocService.getUser("rocAdmin_settings").subscribe((res) => {
      if (res && res.length) {
        this.settingData = res[0];
        this.totalBarValue = this.settingData["totalBar"];
      }
    });
  }

  initForm(data?: any) {
    this.hydrationForm = this.fb.group({
      intake: [
        this.patients ? this.patients["intake"] : "",
        Validators.required,
      ],
    });
  }

  ngOnDestroy() {
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
    super.ngOnDestroy();
  }

  getPatientLeveldata(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe((data) => {
      if (data && data.length) {
        this.assessmentData = [...data];
        this.assessmentData.map((x) => {
          x.label = x.title;
          x.value = x.id;
        });
      }
    });
  }

  loadedDetect() {
    this.loaded = true;
    super.setLoaded();
    this.getAsmtLogs();
  }

  getAsmtLogs() {
    this.unsub$[++this.subNum] =  this.rocService
      .getUserByWhereRef(
        "assessment-logs",
        "patient_id",
        this.editId,
        "patients"
      )
      .subscribe((res) => {
        if (res) {
          this.asmtLogs = [...res];
          this.asmtLogs.sort((a: any, b: any) => b.created_at - a.created_at);
          this.asmtLogs.map((x) => {
            x.asmt_time = new Date(x.created_at).toLocaleString();
            x.type = x.asmt_type.replace(/_/g, " ");
          });
          let newAry = _.groupBy(this.asmtLogs, "asmt_type");
          this.drinkLogs = newAry["roc_drink"]
            ? newAry["roc_drink"].splice(0, 4)
            : [];
          console.log("this drinkLogs", this.drinkLogs)
          this.eatLogs = newAry["roc_eat"]
            ? newAry["roc_eat"].splice(0, 4)
            : [];
          this.holisticLogs = newAry["roc_holistic"]
            ? newAry["roc_holistic"].splice(0, 4)
            : [];
        }
      });
  }

  openModal(
    body: any,
    header: any = null,
    footer: any = null,
    data: any = null
  ) {
    this.initForm(data);
    if (data) {
      this.editId = data.id;
      // this.isEdit = true;
    } else {
      // this.isEdit = false;
    }
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
    });
  }

  closeModal() {
    this.modal.close();
    // if (!this.isEdit) this.hospitalForm.reset();
    // this.hydrationForm.reset();
    this.submitted = false;
  }

  onTypeSelect(arg) {
    // console.log('ARG :: ', arg)
  }

  addHydration() {
    console.log("FORM VALUE :: ", this.hydrationForm.value);
    console.log(
      "FROM SETT DATA :: ",
      this.settingData[this.hydrationForm.value.intake]
    );
    console.log("PD :: ", this.patients);
    // return;
    this.submitted = true;
    let lastIntake = 0;
    if (this.patients && this.patients["intakeValue"]) {
      // if(this.settingData && this.settingData[this.hydrationForm.value.intake]) {
      lastIntake =
        lastIntake +
        +this.patients["intakeValue"] +
        +this.settingData[this.hydrationForm.value.intake];
    } else {
      lastIntake =
        lastIntake + +this.settingData[this.hydrationForm.value.intake];
    }
    let dataObj = {
      intake: this.hydrationForm.value.intake,
      intakeValue: +lastIntake,
      // intakeValue: lastIntake + this.settingData[this.hydrationForm.value.intake]
    };
    console.log("LAST INTAKE :: ", lastIntake);
    console.log("DATA OBJ :: ", dataObj);
    if (this.hydrationForm.invalid) return;
    else {
      this.rocService.updateUser("patients", dataObj, this.editId).then(
        (res) => {
          //this.closeModal();
          this.generalService.showSuccess("Data updated successfully!!", "");
        },
        (err) => {
          console.log("ERR::", err);
          this.generalService.showError(err.message, "");
        }
      );
    }
  }

  get f() {
    return this.hydrationForm.controls;
  }

  goTo(type) {
    const data: NavigationExtras = {
      state: {
        patient_id: this.editId,
        roc_type: type,
      },
    };
    // alert(this.patients['drink'])
    if (
      !this.patients["drink"] &&
      !this.patients["eat"] &&
      !this.patients["holistic"]
    )
      this.router.navigate(["/assessment"], data);
  }

  goToLog() {
    this.router.navigate(["/carelogs", this.editId]);
  }

  goToHydration() {
    this.router.navigate(["/hydration", this.editId]);
  }
}
