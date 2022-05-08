import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { combineLatest, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { BasePageComponent } from "../../base-page";
import { IAppState } from "../../../interfaces/app-state";
import { HttpService } from "../../../services/http/http.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IOption } from "../../../ui/interfaces/option";
import { Content } from "../../../ui/interfaces/modal";
import { TCModalService } from "../../../ui/services/modal/modal.service";
import { RocadminService } from "src/app/services/generalService/rocadmin.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { Observable } from "rxjs";
import * as _ from "lodash";
import * as PageActions from "../../../store/actions/page.actions";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { Subject } from "rxjs";
import { async } from "@angular/core/testing";
import { IUserData } from "src/app/interfaces/dashboard";
import { IPatient, ICarehomeData, ICareData, IEntryPoint, IAssesment, ICurrentUser } from "src/app/interfaces/patient";
import { IHospital } from "src/app/interfaces/hospital";
// import { IPageData } from "src/app/interfaces/page-data";

@Component({
  selector: "page-carelogs",
  templateUrl: "./carelogs.component.html",
  styleUrls: ["./carelogs.component.scss"],
})
export class PageCarelogsComponent
  extends BasePageComponent
  implements OnInit, OnDestroy
{
  @ViewChild("modalDelete", { static: true }) modalDelete: ElementRef<any>;

  submitted = false;
  date: Date;
  patients: IPatient[] = [];
  entryPointData: IEntryPoint[] = [];
  assessmentData: IAssesment[] = [];
  hospitalData: IHospital[] = [];
  carehomeData: ICarehomeData[] = [];
  carerData: ICareData[] = [];
  // arrayFilter: any[] = [];
  selectedDevice: any[];
  selectedDeviceNew: any;
  patientForm: FormGroup;
  gender: IOption[];
  status: IOption[];
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  currentUser: any;
  currentRole: string;
  currentShowDiv: boolean = false;
  isEdit: boolean = false;
  editId: string;
  deleteId: string;
  hosId: string;
  CH_email: string;
  nur_email: string;
  defaultLevel: string;
  curr_CHObj: string;
  curr_CRObj: string;
  downloadURL: Observable<string>;
  // bedsArray = [];
  selectedFile: File | null = null;
  changes: boolean;
  // colorVal: any;
  oldImgFile: any;
  // settingData;
  //onselect model
  // hospital_model = [];
  // hospitalTemp = [];
  hospitalTempStore: string[] = [];
  // carehome_model = [];
  // carer_model = [];
  // asmtLogs: any[] = [];
  // drinkLogs: any[] = [];
  // orangeVal: any;
  unsubscribePT: Subscription;
  // rocKnowledge: any = [];
  // concernData: any = [];
  groupHospital: any[] = [];
  userData: any[] = [];
  // adminPatientHospital;
  carehomeDataObj;
  // totalBarValue;
  test: any = [];
  ngOn$: Subscription;
  pointOfEntry$: Subscription;
  carers$: Subscription;
  patientLevel$: Subscription;
  patientHospitalId$: Subscription;
  unsub1$: Subscription;
  unsub2$: Subscription;
  unsub3$: Subscription;
  modelFeedback: string = "";
  concernedPatients = [];
  test1: any = [];
  // uniqCarer: any = [];
  test2: any = [];
  patients2: any = [];
  carerdataNew: any = [];
  uniqCarerData: any = [];
  selectedDataUpdated;
  someData = [];
  test3: any = [];
  testack: any = [];
  filterFromDate: any;
  disabledDate = (current: Date): boolean => {
    return new Date(current) > new Date();
  };
  mainAvtar: string;
  current: string;
  dateErrroMessage: boolean;
  fromToErrroMessage: boolean;
  checkoutForm = this.fb.group({
    fromDate: "",
    toDate: "",
  });
  rendered: boolean = false;
  label: string;
  loggedInManager: IUserData;
  acknoledgementDoc: any = [];
  acknoledgedData: any = [];
  careLogsData$: Subscription;
  num: number = 0;
  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public modal: TCModalService,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    super(store, httpSv);
    this.editId = this.route.snapshot.paramMap.get("id");
    // this.pageDataRef = this.rocService
    //   .getUserById("patients", this.editId)
    //   .subscribe((res: any) => {
    //     if (res) {
    //       this.label = res.fname + " " + res.lname || "";
    //       this.pageData.title = this.label;
    //       this.pageData.loaded = false;
    //       super.ngOnInit();
    //     }
    //   });
    // this.pageDataRef.unsubscribe();
    // this.pageData = {
    //   title: "Patient Assessment Form",
    //   breadcrumbs: [
    //     {
    //       title: "ROC",
    //       route: "/default-dashboard",
    //     },
    //     {
    //       title: "Patients",
    //       route: "/patients",
    //     },
    //   ]
    // };
    this.patients = [];
    this.defaultAvatar = "assets/content/avatar.jpg";
    this.currentAvatar = this.defaultAvatar;
    this.mainAvtar = "assets/content/imgpsh_fullsize_anim.jpg";
    this.current = this.mainAvtar;
    this.ngOn$ = this.route.queryParams.subscribe((params) => {
      if (params["hid"]) {
        this.hosId = params["hid"];
        this.ngOnInit();
      }
    });
  }
  destroy$: Subject<boolean> = new Subject<boolean>();
  onSubmit(): void {
    this.test = this.test2;
    let filterToDate = null;
    if (
      !!this.checkoutForm.value.fromDate &&
      this.checkoutForm.value.toDate &&
      this.checkoutForm.value.fromDate != "" &&
      this.checkoutForm.value.toDate != ""
    ) {
      this.filterFromDate = new Date(
        this.checkoutForm.value.fromDate
      ).toISOString();
      filterToDate = new Date(this.checkoutForm.value.toDate).toISOString();
    } else {
      this.filterFromDate = new Date(
        this.checkoutForm.value.fromDate
      ).toLocaleString();
      filterToDate = new Date(this.checkoutForm.value.toDate).toLocaleString();
    }
    this.test.forEach((item) => {
      item.created_at = new Date(item.created_at).toISOString();
    });
    if (!this.checkoutForm.value.fromDate) {
      this.dateErrroMessage = true;
    } else {
      if (this.checkoutForm.value.fromDate && this.checkoutForm.value.toDate) {
        let t1 = this.filterFromDate.split("T")[0];
        let fromdate = t1.concat("T00:00:00.000Z");
        let todate = filterToDate.split(",")[0];
        if (todate < fromdate) {
          this.fromToErrroMessage = true;
        } else {
          if (!!this.selectedDeviceNew && this.selectedDeviceNew != "") {
            let filterValueFinallatest = this.test.filter(
              (m) =>
                m.created_at >= fromdate &&
                m.created_at <= todate &&
                m.created_by.toLowerCase() ==
                  this.selectedDeviceNew.toLowerCase()
            );
            this.test = filterValueFinallatest;
            this.test3 = this.test;
            this.fromToErrroMessage = false;
          } else {
            const DateLatest = fromdate.split("/").join("-");
            const ToLatestDate = todate.split("/").join("-");
            let filterValueFinallatestData = this.test.filter(
              (m) => m.created_at >= DateLatest && m.created_at < ToLatestDate
            );
            this.test = filterValueFinallatestData;
            this.test3 = this.test;
            this.fromToErrroMessage = false;
          }
        }
      } else {
        let f1 = this.filterFromDate.split(",")[0];
        if (!!this.selectedDeviceNew && this.selectedDeviceNew != "") {
          let filterValueFinallatest = this.test.filter(
            (x) =>
              x.created_at_date == f1 &&
              x.created_by.toLowerCase() == this.selectedDeviceNew.toLowerCase()
          );
          this.test = filterValueFinallatest;
          this.test3 = this.test;
        } else {
          let filterValueFinal = this.test.filter(
            (m) => m.created_at_date == f1
          );
          this.test = filterValueFinal;
          this.test3 = this.test;
          this.fromToErrroMessage = false;
        }
      }
      this.dateErrroMessage = false;
    }
  }

  onChangeNew($event) {
    if (
      !!this.checkoutForm.value.fromDate &&
      !!this.checkoutForm.value.fromDate
    ) {
      if (
        this.checkoutForm.value.fromDate != "" ||
        this.checkoutForm.value.toDate != ""
      ) {
        if ($event.target.value == "") {
          this.test = this.test2;
        } else {
          this.test = this.test3;
        }
      }
    } else {
      this.test = this.test2;
    }

    if ($event.target.value != "") {
      let filterValue = this.test.filter(
        (x) => x.created_by == $event.target.value
      );
      this.test = filterValue;
    } else {
      if (
        this.checkoutForm.value.fromDate != "" ||
        this.checkoutForm.value.toDate != ""
      ) {
        this.test = this.test3;
      } else {
        this.test = this.test2;
      }
    }
  }

  ngOnInit() {
    this.getPatientHospitalId();
    this.getCareLogsData();
    localStorage.removeItem("patientClick");
    localStorage.removeItem("secondClick");
    this.getPatientLeveldata("patient_level");
    this.rendered = true;
    this.unsub1$ = this.rocService.getUserRole().subscribe(
      (res) => {
        if (res && res.length) {
          this.currentUser = res;
          this.currentRole = this.currentUser[0].role["label"];
          if (
            this.currentRole === "roc-admin" ||
            this.currentRole === "super-admin"
          ) {
            this.unsub2$ = this.rocService.getUser("hospitals").subscribe((res) => {
              if (res && res.length) {
                this.hospitalData = res;
                this.hospitalData.map((x) => {
                  (x.value = x.id), (x.label = x.name);
                });
              }
            });
            // this.getPatient("patients", "setLoaded", this.hosId);
          }
          else if (this.currentRole === "carehome-manager") {
            //GET HIS OWN RECORD ID
            this.unsub2$ = this.rocService
              .getPatientByIdRole("carehome_manager", "user.uid")
              .subscribe((res) => {
                if (res) {
                  this.carehomeData = res;
                }
                this.unsub3$ = this.rocService
                  .getUserByWhereRef(
                    "carers",
                    "care_home",
                    this.carehomeData[0].id,
                    "carehome_manager"
                  )
                  .subscribe((res) => {
                    if (res && res.length) {
                      this.carerData = res;
                      this.carerData.map((x) => {
                        (x.value = x.id), (x.label = x.fname);
                      });
                    }
                  });
                // this.getPatient("patients", "setLoaded", this.hosId);
              });
            //Get nurse data associated with his id
          }
          else if (this.currentRole === "chm-group") {
            //GET HIS OWN RECORD ID
            this.unsub2$ = this.rocService
              .getPatientByIdRole("chm_group", "user.uid")
              .subscribe((res) => {
                if (res) {
                  this.carehomeData = res;
                  this.carehomeDataObj = this.carehomeData[0];
                }
                // this.getPatient("patients", "setLoaded", this.hosId);
              });
          }
          else if (this.currentRole === "nurse") {
            this.unsub2$ = this.rocService
              .getPatientByIdRole("carers", "user.uid")
              .subscribe((res) => {
                if (res) {
                  this.carerData = res[0];
                  this.carehomeData = res;
                  // this.getPatient(
                  //   "patients",
                  //   "setLoaded",
                  //   this.carerData["hospital"].id
                  // );
                }
              });
          }
          else if (this.currentRole === "chm-group") {
            // this.getPatient("patients", "setLoaded", this.hosId);
          }
        }
      },
      (err) => {
        console.log("Err", err);
      }
    );
  }
  getDataForManager(uid: any): any {
    this.rocService
      .getUserByWhereHL("carehome_manager", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
      });
  }

  getDataForAdmin(uid: any): any {
    this.rocService
      .getUserByWhereHL("roc_admin", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
      });
  }
  transformDate(value) {
    let localDt = new Date(value).toLocaleString();
    let tempDt = localDt.split(":", 2);
    return tempDt[0] + ":" + tempDt[1];
  }
  goTo(id, type) {
    const data: NavigationExtras = {
      state: {
        patient_id: id,
        roc_type: type,
      },
    };
    this.router.navigate(["/assessment"], data);
  }

  setCHGHospital() {
    let userData = this.userData;
    if (userData && userData.length > 0)
      this.groupHospital = userData[0].hospital.map((x) => x.id);
    let newData = this.patients.filter((element) =>
      this.groupHospital.includes(element.hospital["id"])
    );
    this.patients = [...newData];
  }

  getPatient(dataName: string, callbackFnName?: string, hospitalId?: string) {
    let refKeyAr = ["hospital", "care_home", "carer_id", "chm_group"];
    let func;
    if (hospitalId) {
      func = this.rocService.getUserByWhereRef(
        dataName,
        "hospital",
        hospitalId,
        "hospitals",
        refKeyAr
      );
    }
    else {
      if (this.currentRole == "carehome-manager") {
        func = this.rocService.getUserByWhereRef(
          dataName,
          "care_home",
          this.carehomeData[0].id,
          "carehome_manager",
          refKeyAr
        );
      } else if (this.currentRole == "nurse") {
        func = this.rocService.getUserByWhereRef(
          dataName,
          "carer_id",
          this.carerData["id"],
          "carers",
          refKeyAr
        );
      } else {
        func = this.rocService.getUserWithRef(dataName, refKeyAr);
      }
    }
    this.unsubscribePT = func.subscribe(
      (data) => {
        if (data) {
          let arrayFilter;
          arrayFilter = data;

          arrayFilter
            .sort((a: any, b: any) => b.created_at - a.created_at)
            .map((x: any, i) => {
              if (x.created_by && x.created_by["name"]) {
                x.created_by =
                  x.created_by["name"] + " / " + x.created_by["role"].label;
                x["assessment"] = {
                  eat: x.eat ? x.eat : "",
                  drink: x.drink ? x.drink : "",
                  holistic: x.holistic ? x.holistic : "",
                };
                x["idd"] = i + 1;
                x.dob = new Date(x.dob.seconds * 1000);
              }
            });
          this[dataName] = arrayFilter;
          if (this.currentRole == "chm-group") {
            this.rocService
              .getUserByWhere("chm_group", "user.uid", this.currentUser[0].uid)
              .subscribe((res: any) => {
                if (res && res.length > 0) this.userData = [...res];
                this[dataName] = this.patients;
                this.setCHGHospital();
              });
          }
          callbackFnName && typeof this[callbackFnName] === "function"
            ? this[callbackFnName](this[dataName])
            : null;
        }
      },
      (err) => console.log(err)
    );
  }

  pointOfEntry(dataName: string) {
    this.pointOfEntry$ = this.rocService.getUser(dataName).subscribe((data) => {
      if (data && data.length) {
        this.entryPointData = [...data];
        this.entryPointData.map((x) => {
          x.label = x.entry_from;
          x.value = x.id;
        });
      }
    });
  }

  getPatientLeveldata(dataName: string) {
    this.patientLevel$ = this.rocService.getUser(dataName).subscribe((data) => {
      if (data && data.length) {
        this.assessmentData = [...data];
        this.assessmentData.map((x) => {
          x.label = x.title;
          x.value = x.id;
        });
        let temp = this.assessmentData.find((x) => {
          return x.is_default == true;
        });
        this.defaultLevel = temp.id;
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.unsubscribePT) 
    {
      this.unsubscribePT.unsubscribe();
    }
    if (this.careLogsData$)
    {
      this.careLogsData$.unsubscribe();
      console.log("unsubscribe", this.careLogsData$.closed)
    }
    if (this.ngOn$) this.ngOn$.unsubscribe();
    if (this.patientLevel$) this.patientLevel$.unsubscribe();
    if (this.pointOfEntry$) this.pointOfEntry$.unsubscribe();
    if (this.patientHospitalId$) this.patientHospitalId$.unsubscribe();
    if (this.carers$) this.carers$.unsubscribe();
    if (this.unsub1$) this.unsub1$.unsubscribe();
    if (this.unsub2$) this.unsub2$.unsubscribe();
    if (this.unsub3$) this.unsub3$.unsubscribe();
  }

  goToProfileUserFriendly(pid) {
    this.router.navigate([`user-profile/${pid}`]);
  }

  sendmail(data) {
    this.httpSv.sendMail(data).subscribe((res) => {});
  }
  getCareLogsData() {
    this.careLogsData$ = combineLatest(
      this.rocService.getUserByWhereWithId("roc_acknowledgements"),
      this.rocService.getUserByWhereWithId("roc_point_of_care_hydration"),
      this.rocService.getUserByWhereRef("assessment-logs", "patient_id", this.editId, "patients")
    ).subscribe(
      async ([rocKnowledge, concernData, res]) => {
        console.log('aaaaaa', concernData, rocKnowledge, res)
        // this.rocKnowledge = rocKnowledge;
        // this.concernData = concernData;

        this.test1 = concernData;
        this.test1.map((x) => {
          let xt = new Date(x.date_time_of_record).toLocaleString();
          if (xt != "Invalid Date") {
            let f1 = xt.split(",")[0];
            let test1 = xt.split(",")[1];
            let test2 = test1.split(" ")[2];
            let test3 = test1.replace(test2, "");
            let fnl = f1.concat("," + test3);
            return (x.date_time_of_record = fnl);
          }
        });

        this.testack = rocKnowledge;
        this.testack.map((x) => {
          let xt = new Date(x.assessment_time).toLocaleString();
          if (xt != "Invalid Date") {
            let f1 = xt.split(",")[0];
            let test1 = xt.split(",")[1];
            let test2 = test1.split(" ")[2];
            let test3 = test1.replace(test2, "");
            let fnl = f1.concat("," + test3);
            return (x.assessment_time = fnl);
          }
        });

        if (res) {
          let arrayFilter;
          arrayFilter = res;
          // let i = 1;
          // this.rendered = true;
          this.store.dispatch(new PageActions.Update({ loaded: true }))
          arrayFilter
            .sort((a: any, b: any) => b.created_at - a.created_at)
            .map((x: any, i) => {
              if (x.created_by && x.created_by["name"]) {
                x.sr = i + 1;
                x.carername = x.created_by["name"];

                x.created_at_date_time = new Date(x.created_at).toLocaleString(
                  "en-GB"
                );

                x.created_at_date_time = x.created_at_date_time.replace(
                  /(\d{1,2}:\d{2}):\d{2}/,
                  "$1"
                );

                x.created_by = x.created_by;
                this.getConcernedPatients(x.created_at, x);
                this.getROCAcknowledgements(x.created_at, x);
                x.created_at_date = new Date(x.created_at).toLocaleDateString();
                let xTime = this.formatAMPM(new Date(x.created_at));
                x.created_at_date_time =
                  x.created_at_date_time.replace(
                    x.created_at_date_time.substr(
                      x.created_at_date_time.length - 6
                    ),
                    ""
                  ) +
                  " " +
                  xTime;
                x.feedback = x.created_at;
                x.remarks = x.created_at;
                x.rating = x.rating.score;
                x["assessment"] = {
                  eat: x.eat ? x.eat : "",
                  drink: x.drink ? x.drink : "",
                  holistic: x.holistic ? x.holistic : "",
                };
              }
            });
          this.test = [...res];
          this.getMemberShip();
          this.patients = arrayFilter;
          
          // this.rendered = true;
          // this.store.dispatch(new PageActions.Update({ loaded: true }))
          // if (this.test.length == 0) this.rendered = true;
          // this.patients = arrayFilter;
          // this.test.forEach((item) => {
          //   this.hospitalTemp.push(item.carername);
          // });
          // this.test2 = this.test;
          // this.uniqCarer = _.uniqBy(this.hospitalTemp, ["asc"]);
        }
        
      }
    );
  }
  formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  getROCAcknowledgements(createdAt, object) {
    // let cA = createdAt;
    // let c = this.rocKnowledge;
    // if (c && c.length > 0) {
      // this.testack = c;
      // this.testack.map((x) => {
      //   let xt = new Date(x.assessment_time).toLocaleString();
      //   if (xt != "Invalid Date") {
      //     let f1 = xt.split(",")[0];
      //     let test1 = xt.split(",")[1];
      //     let test2 = test1.split(":")[2];
      //     let test3 = test1.replace(test2, "");
      //     let fnl = f1.concat("," + test3);
      //     return (x.assessment_time = fnl);
      //   }
      // });
      // let filterNotes = c.filter((x) => x.assessment_time == createdAt);
      // let xt = new Date(createdAt).toLocaleString();
      // let f1 = xt.split(",")[0];
      // let test1 = xt.split(",")[1];
      // let test2 = test1.split(":")[2];
      // let test3 = test1.replace(test2, "");
      // let fnl = f1.concat("," + test3);
      // createdAt = fnl;
      // if (!!object) {
      //   if (!!filterNotes) {
      //     filterNotes.forEach((item) => {
      //       object.remarks = "N/A";
      //     });
      //   } else {
      //     object.remarks = "N/A";
      //   }
      // }
      let carerdata = this.carerdataNew.filter(
        (xx) => xx.user.uid == object.created_by["uid"]
      )[0];
      if (carerdata)
        object["created_by"] = carerdata?.fname + " " + carerdata?.lname;
      return object;
    // }
  }
  getConcernedPatients(createdAt, object) {
    // let cA = createdAt;
    // this.test1 = this.concernData;

    // this.test1.map((x) => {
    //   // if (x.date_time_of_record.toString().slice(0, 10) == createdAt.toString().slice(0, 10)) {
    //   //   console.log(x.date_time_of_record, createdAt.toString());
    //   // }
    //   let xt = new Date(x.date_time_of_record).toLocaleString();
    //   if (xt != "Invalid Date") {
    //     let f1 = xt.split(",")[0];
    //     let test1 = xt.split(",")[1];
    //     let test2 = test1.split(":")[2];
    //     let test3 = test1.replace(test2, "");
    //     let fnl = f1.concat("," + test3);
    //     return (x.date_time_of_record = fnl);
    //   }
    // });
    // let xt = new Date(createdAt).toLocaleString();
    // let f1 = xt.split(",")[0];
    // let test1 = xt.split(",")[1];
    // let test2 = test1.split(":")[2];
    // let test3 = test1.replace(test2, "");
    // let fnl = f1.concat("," + test3);
    // createdAt = fnl;
    // let filterNotes = c.filter(
    //   (x) => x.date_time_of_record == createdAt
    // );
    // if (!!object) {
    //   if (!!filterNotes) {
    //     filterNotes.forEach((item) => {
    //       console.log("feedback item", item);
    //       object.feedback = cA;
    //     });
    //   } else {
    //     object.feedback = "N/A";
    //   }
    // }
    let carerdata = this.carerdataNew.filter(
      (xx) => xx.user.uid == object.created_by["uid"]
    )[0];
    if (carerdata)
      object["created_by"] = carerdata?.fname + " " + carerdata?.lname;

    return object;
  }
  get f() {
    return this.patientForm.controls;
  }

  updateModal<T>(body: Content<T>, header: Content<T> = null, value?) {
    value = new Date(value).toLocaleString();
    let f1 = value.split(",")[0];
    let test1 = value.split(",")[1];
    let test2 = test1.split(" ")[2];
    let test3 = test1.replace(test2, "");
    let fnl = f1.concat("," + test3);
    let findData = this.test1.find((x) => x.date_time_of_record == fnl);
    this.modelFeedback = "";
    if (!!findData) {
      if (findData.notes === "") {
        this.modelFeedback = "N/A";
      } else {
        this.modelFeedback = findData.notes;
      }
      this.modal.open({
        body: body,
        header: header,
        closeButton: true,
      });
    }
  }
  updateModal_remarks<T>(body: Content<T>, header: Content<T> = null, value?) {
    value = new Date(value).toLocaleString();
    let f1 = value.split(",")[0];
    let test1 = value.split(",")[1];
    let test2 = test1.split(" ")[2];
    let test3 = test1.replace(test2, "");
    let fnl = f1.concat("," + test3);
    let findData = this.testack.find((x) => x.assessment_time == fnl);
    this.modelFeedback = "";
    if (!!findData) {
      if (findData.remarks === "") {
        this.modelFeedback = "N/A";
      } else {
        this.modelFeedback = findData.remarks;
      }
      this.modal.open({
        body: body,
        header: header,
        closeButton: true,
      });
    }
  }
  // close modal window
  closeModal() {
    this.modal.close();
  }
  getMemberShipLevel(value) {
    console.log("feedback", value);
    value = new Date(value).toLocaleString();
    if (value != "Invalid Date") {
      let f11 = value.split(",")[0];
      let test11 = value.split(",")[1];
      let test22 = test11.split(" ")[2];
      let test33 = test11.replace(test22, "");
      let fnl1 = f11.concat("," + test33);
      let findDataNew = this.test1.find((x) => x.date_time_of_record == fnl1);
      if (!!findDataNew) {
        this.currentShowDiv = true;
        if (findDataNew.feedback === "Alright" || findDataNew.feedback == "A") {
          return "assets/img/face-green.png";
        } else if (
          findDataNew.feedback === "Concerned" ||
          findDataNew.feedback == "C"
        ) {
          return "assets/img/face-red.png";
        } else {
          return "assets/img/face-amber.png";
        }
      } else {
        return null;
      }
    }
    else {
      return null;
    }
  }
  getMemberShip() {
    for (let index = 0; index < this.test.length; index++) {
      const element = this.test[index];
      let value = new Date(element.created_at).toLocaleString();
      if (value != "Invalid Date") {
        let f11 = value.split(",")[0];
        let test11 = value.split(",")[1];
        let test22 = test11.split(" ")[2];
        let test33 = test11.replace(test22, "");
        let fnl1 = f11.concat("," + test33);
        let findDataNew = this.test1.find((x) => x.date_time_of_record == fnl1);
        if (!!findDataNew) {
          this.currentShowDiv = true;
          if (findDataNew.feedback === "Alright" || findDataNew.feedback == "A") {
            // this.test[index].feedback = "assets/img/face-green.png";
            this.test[index].feedback = {
              date: element.created_at,
              src: "assets/img/face-green.png"
            }
          } else if (
            findDataNew.feedback === "Concerned" ||
            findDataNew.feedback == "C"
          ) {
            this.test[index].feedback = {
              date: element.created_at,
              src: "assets/img/face-red.png"
            }
            
            // this.test[index].feedback = "assets/img/face-red.png";
          } else {
            this.test[index].feedback = {
              date: element.created_at,
              src: "assets/img/face-amber.png"
            }
          }
        } else {
          this.test[index].feedback = {
            date: element.created_at,
            src: "assets/img/face-amber.png"
          }
          // this.test[index].feedback = "assets/img/face-amber.png";
        }
      }
      else {
        
      }
    }
    console.log("this test", this.test);
  }
  getPatientHospitalId() {
    this.editId = this.route.snapshot.paramMap.get("id");
    this.patientHospitalId$ = this.rocService
      .getUserWithRefByID("patients", this.editId, [
        "hospital",
        "care_home",
        "carer_id",
      ])
      .subscribe((res) => {
        if (res) {
          this.patients2 = res;
          const HostIdMain = this.patients2["hospital"].id;
          this.carers$ = this.rocService.getUser("carers").subscribe((data) => {
            if (data && data.length) {
              this.carerdataNew = [...data];

              this.carerdataNew.forEach((item) => {
                if (item["hospital"].id === HostIdMain)
                  this.hospitalTempStore.push(item.fname + " " + item.lname);
              });
              this.uniqCarerData = _.uniqBy(this.hospitalTempStore);
            }
          });
        }
      });
  }

  ngOnChangesUpdated(changes) {
    if (changes.selected.currentValue) {
      this.selectedDataUpdated = this.someData.filter((x) => {
        return x.value === changes.selected.currentValue;
      });
    }
  }
  getSpan(value) {
    let status = false;
    value = new Date(value).toLocaleString();
    if (value != "Invalid Date") {
      let f11 = value.split(",")[0];
      let test11 = value.split(",")[1];
      let test22 = test11.split(" ")[2];
      let test33 = test11.replace(test22, "");
      let fnl1 = f11.concat("," + test33);
      let findDataNew = this.test1.find((x) => x.date_time_of_record == fnl1);
      if (!!findDataNew) {
        this.currentShowDiv = true;
        if (findDataNew.feedback === "Alright" || findDataNew.feedback == "A") {
          status = false;
        } else if (
          findDataNew.feedback === "Concerned" ||
          findDataNew.feedback == "C"
        ) {
          status = false;
        } else {
          status = false;
        }
      } else {
        status = true;
      }
    } else {
      status = true;
    }
    return status;
  }
  getSpan_ack(value) {
    let status = false;
    value = new Date(value).toLocaleString();
    if (value != "Invalid Date") {
      let f11 = value.split(",")[0];
      let test11 = value.split(",")[1];
      let test22 = test11.split(" ")[2];
      let test33 = test11.replace(test22, "");
      let fnl1 = f11.concat("," + test33);
      let findDataNew = this.testack.find((x) => x.assessment_time == fnl1);
      if (!!findDataNew) {
        this.currentShowDiv = true;
        if (findDataNew.remarks == "") {
          status = false;
        } else {
          status = true;
        }
      } else {
        status = false;
      }
    } else {
      status = false;
    }
    return status;
  }
  saveData(value) {
    console.log("Values Submited");
  }
}
