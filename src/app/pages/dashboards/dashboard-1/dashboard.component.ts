import { Component, OnDestroy, OnInit } from "@angular/core";

import { Store } from "@ngrx/store";
import { EChartOption } from "echarts";
import { BasePageComponent } from "../../base-page";
import { IAppState } from "../../../interfaces/app-state";
import { HttpService } from "../../../services/http/http.service";
import { RocadminService } from "src/app/services/generalService/rocadmin.service";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { forkJoin, Subject, Subscription } from "rxjs";
import { inArray } from "jquery";
import {
  ISettingdata,
  IRocdata,
  IChdata,
  IAreaRocDrink,
  ICarer,
  IHospitalData,
  IBarChartOpinion,
  IBarChartData,
  IArrayfilter,
  IDoubleChartColors,
  IAcknoledgedData,
  IRocDrinkSeries,
  IAreaRocEat,
  IUserData,
  IAcknoledgementDoc,
  IConcernCount,
  IBarChartColor,
  IDueData,
} from "src/app/interfaces/dashboard";
import { ICurrentUser } from "src/app/interfaces/patient";

@Component({
  selector: "page-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class PageDashboardComponent
  extends BasePageComponent
  implements OnInit, OnDestroy
{
  rocDrink: number = 0;
  rocEat: number = 0;
  rocHolistic: number = 0;

  settingdata: ISettingdata;
  hsOptions: EChartOption;
  paOptions: EChartOption;
  pgOptions: EChartOption;
  dOptions: EChartOption;
  piOptions: EChartOption;
  heOptions: EChartOption;
  areaOptions0: EChartOption;
  areaOptions1: EChartOption;
  areaOptions2: EChartOption;

  // appointments: any[];
  // piePatternSrc: string;
  // piePatternImg: any;
  // pieStyle: any;
  rocdata: IRocdata[] = [];
  CHdata: IChdata[] = [];
  carerdata: IDueData[] = [];
  patientdata: IDueData[] = [];
  userRole: string;
  currentUser: ICurrentUser;
  // hsName;

  roc_drink: string[] = [];
  roc_eat: string[] = [];
  roc_holistic: string[] = [];
  labelData: string[] = [];
  lastData: IDueData[] = [];
  dueData: IDueData[] = [];

  swallow: string[] = [];
  assist: string[] = [];
  encourage: any[] = [];
  hearing: string[] = [];
  vision: string[] = [];
  speech: string[] = [];
  recongition: any[] = [];
  //asmtnmber
  drink_number: number;
  eat_number: number;
  holistic_number: number;
  arrayFilter: IArrayfilter[] = [];

  doughnutChartLabels: string[];
  doughnutChartData: number[];
  doughnutChartType: string;
  doughnutChartColors: IDoubleChartColors[] = [];
  doughnutChartOptions: any = {
    responsive: true,
    tooltips: {
      enabled: true,
      mode: "single",
      callbacks: {
        label: function (tooltipItem, data) {
          var allData = data.datasets[tooltipItem.datasetIndex].data;
          var tooltipLabel = data.labels[tooltipItem.index];
          var tooltipData = allData[tooltipItem.index];
          return tooltipLabel + ": " + tooltipData + "%";
        },
      },
    },
  };
  doughnutChartLegend: boolean = true;
  //bar chart ng2
  barChartOptions: IBarChartOpinion;
  barChartLabels: string[];
  barChartLabelsHolistic: string[];
  barChartType: string;
  barChartLegend: boolean;
  barChartDataDrink: IBarChartData[];
  barChartDataEat: IBarChartData[];
  // hoptitalIdInside: any[];
  barChartDataHolistic: IBarChartData[];
  barChartColors: IBarChartColor[];
  // dueAssessmentCount: any;

  //unsubscribe var
  unsub$: Subscription[] = [];
  subNum: number = 0;
  //area chart
  areaRocDrink: IAreaRocDrink[] = [];
  areaRocDrinkSeries: IRocDrinkSeries[] = [];
  areaRocEat: IAreaRocEat[] = [];
  areaRocEatSeries: IAreaRocEat[] = [];
  areaRocHolistic: IAreaRocEat[] = [];
  areaRocHolisticSeries: IAreaRocEat[] = [];

  days: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dataForChart: string[] = [];
  groupHospital: string[] = [];
  userData: IUserData[] = [];
  concernedPatients: IAcknoledgementDoc[] = [];
  carerData: any[] = [];
  // curr_CHObj;
  currentRole: string;
  patients: any[] = [];
  acknoledgementDoc: IAcknoledgementDoc[] = [];
  acknoledgedData: IAcknoledgedData[] = [];
  loggedInManager: IUserData;
  patientdatalength: number;
  hospitalData: IHospitalData[] = [];
  carehomeData: IUserData[] = [];
  carehomeDataObj: IUserData;
  hs_name: string;
  chm_name: string;
  showMovingAvg: number = null;
  unsubPT: Subscription;
  carers: ICarer[] = [];
  adminCarersHospital: string;
  concernCount: IConcernCount[] = [];
  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public rocService: RocadminService,
    public translate: TranslateService
  ) {
    super(store, httpSv);
    // Object.assign(this, this.multi );
    this.pageData = {
      title: "",
      loaded: false,
      breadcrumbs: [
        {
          title: "Dashboards",
          route: "default-dashboard",
        },
        {
          title: "Default",
        },
      ],
    };
    // this.appointments = [];

    this.doughnutChartLabels = ["Green", "Orange", "Red"];
    this.doughnutChartType = "doughnut";
    this.doughnutChartColors = [
      { backgroundColor: ["#3c9210", "#FFA500", "red"] },
      { borderColor: ["#ed5564", "#e9e165", "#64B5F6"] },
    ];
    this.barChartOptions = {
      scaleShowVerticalLines: true,
      responsive: true,
      title: {
        fontFamily: "quicksand-medium",
        fontSize: 16,
        fontColor: "#747d8c",
      },
    };
    this.barChartLabels = ["Swallow", "Assist", "Encourage"];
    this.barChartLabelsHolistic = [
      "Hearing",
      "Vision",
      "Speech",
      "Recognision",
    ];

    this.barChartType = "bar";
    this.barChartLegend = false;
    this.barChartDataDrink = [
      { data: [this.swallow[0], this.assist[0], this.encourage[0], 0] },
      { data: [this.swallow[1], this.assist[1], this.encourage[1], 0] },
      { data: [this.swallow[2], this.assist[2], this.encourage[2], 0] },
    ];
    this.barChartDataEat = [
      { data: [this.swallow[0], this.assist[0], this.encourage[0], 0] },
      { data: [this.swallow[1], this.assist[1], this.encourage[1], 0] },
      { data: [this.swallow[2], this.assist[2], this.encourage[2], 0] },
    ];
    this.barChartDataHolistic = [
      {
        data: [
          this.hearing[0],
          this.vision[0],
          this.speech[0],
          this.recongition[0],
          0,
        ],
      },
      {
        data: [
          this.hearing[1],
          this.vision[1],
          this.speech[1],
          this.recongition[1],
          0,
        ],
      },
      {
        data: [
          this.hearing[2],
          this.vision[2],
          this.speech[2],
          this.recongition[2],
          0,
        ],
      },
    ];
    this.barChartColors = [
      {
        backgroundColor: "green",
        pointHoverBackgroundColor: "green",
      },
      {
        backgroundColor: "orange",
        pointHoverBackgroundColor: "orange",
      },
      {
        backgroundColor: "red",
        pointHoverBackgroundColor: "red",
      },
    ];
    console.log("this barChartDataDrink", this.barChartDataDrink);
  }
  onSelect(event) {
    console.log(event);
  }
  destroy$: Subject<boolean> = new Subject<boolean>();
  async ngOnInit() {
    super.ngOnInit();
    var hoptitalId;

    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe(
      async (res: any) => {
        if (res) {
          this.currentUser = res[0];
          this.currentRole = this.currentUser.role["label"];
          console.log("this.currentRole", this.currentRole);

          this.userRole = res[0]["role"]["label"];
          // console.log(this.currentRole);
          
          if (this.currentRole == "carehome-manager") {
            this.getDataForAdmin(this.currentUser.uid, "carehome_manager", "user.uid");
            this.getConcernedPatients("carehome-manager");
          } else if (this.currentRole == "roc-admin") {
            this.getDataForAdmin(this.currentUser.uid, "roc_admin", "user.uid");
            this.getConcernedPatients("roc-admin");
          }
          this.unsub$[++this.subNum] = this.rocService
            .getPatientByIdRole("carers", "user.uid")
            .subscribe((res) => {
              if (res) {
                console.log("carerData===========", res);
                this.carerData = res[0];
                this.getPatient(
                  "patients",
                  "setLoaded",
                  this.carerData ? this.carerData["hospital"].id : ""
                );
              }
            });

          if (
            this.currentRole === "roc-admin" ||
            this.currentRole === "super-admin"
          ) {
            this.unsub$[++this.subNum] = this.rocService
              .getUser("hospitals")
              .subscribe((res) => {
                if (res && res.length) {
                  console.log("hospitalData===========", res);
                  this.hospitalData = res;
                  this.hospitalData.map((x) => {
                    (x.value = x.id), (x.label = x.name);
                  });
                  this.showMovingAvg = 1;
                }
              });
              this.getCarerData("carers", "setLoaded");
          } else if (this.currentRole === "carehome-manager") {
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("carehome_manager", "user.uid")
              .subscribe((res) => {
                if (res) this.carehomeData = res;
                console.log("carehomeData :: ", res);
                this.chm_name =
                  this.carehomeData[0].fname + " " + this.carehomeData[0].lname;
                this.getPatient(
                  "patients",
                  "setLoaded",
                  this.carehomeData[0]["hospital"].id
                );
                this.carehomeData[0].hospital.get().then((r) => {
                  this.hs_name = r.data()["name"];
                  this.unsub$[++this.subNum] = this.rocService
                    .getUserByWhere("hospital_settings", "hospital_id", r.id)
                    .subscribe((hos) => {
                      if (hos && hos.length > 0) {
                        console.log("this settingdata", hos[0]);
                        this.settingdata = hos[0];
                        if (this.settingdata.movingavg == "yes")
                          this.showMovingAvg = 1;
                        else this.showMovingAvg = 0;
                      }
                    });
                });
                this.getCarerData("carers", "setLoaded");
              });
          } else if (this.currentRole === "nurse") {
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("carers", "user.uid")
              .subscribe((res) => {
                if (res) {
                  this.carerData = res;
                  console.log("getChartData===========");
                  this.carerData[0].hospital.get().then((r) => {
                    this.hs_name = r.data()["name"];
                    this.unsub$[++this.subNum] = this.rocService
                      .getUserByWhere("hospital_settings", "hospital_id", r.id)
                      .subscribe((hos) => {
                        if (hos && hos.length > 0) {
                          console.log("getChartData===========");
                          this.settingdata = hos[0];
                          if (this.settingdata.movingavg == "yes")
                            this.showMovingAvg = 1;
                          else this.showMovingAvg = 0;
                        }
                      });
                  });
                }
              });
              this.getCarerData("carers", "setLoaded");
          } else if (this.currentRole === "chm-group") {
            // console.log('I AM TWICE')
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("chm_group", "user.uid")
              .subscribe((res) => {
                if (res) this.carehomeData = res;
                console.log("getChartData===========");
                this.carehomeDataObj = this.carehomeData[0];
                console.log("117 :: ", this.carehomeDataObj);
                let hospitalData = [];
                this.carehomeData[0].hospital.forEach((element) => {
                  element.get().then((r) => {
                    // console.log('HOSPITALS :: ', r.data())
                    let x = r.data();
                    if (x != undefined) {
                      this.hospitalData.push({
                        value: element.id,
                        label: x.name,
                      });
                    }
                  });
                });
                // console.log('117 :: ', res)
                this.hospitalData = [...hospitalData];
                // console.log('this.carehomeData :: ', this.carehomeData, this.hospitalData)
              });
            this.unsub$[++this.subNum] = this.rocService
              .getUser("rocAdmin_settings")
              .subscribe(
                (set) => {
                  //  console.log('SET :: ', set)
                  console.log(
                    "set[0]['num_carers']===========",
                    set[0]["num_carers"]
                  );
                  if (set && set.length > 0)
                    this.adminCarersHospital = set[0]["num_carers"];
                },
                (err) => console.log(err)
              );
              this.getCarerData("carers", "setLoaded");
          }
          // this.getCarerData("carers", "setLoaded");
          this.getLanguage("language_label");
          this.getROC("roc_admin");
          this.getCronData("cron-data");
          this.getCH("hospitals");
          // this.getCarers('carers')
          this.getPatients("patients");
          this.getBarChartData("roc_drink");
          this.getBarChartData("roc_eat");
          this.getBarChartData("roc_holistic");

          console.log("--------------------------------------");
        }
      },
      (err) => console.log("Error:::", err)
    );
    this.getData(
      "assets/data/last-appointments.json",
      "appointments",
      "setLoaded"
    );
    this.setHSOptions();
    this.setPIOptions();
    this.setHEOptions();
  }
  // setCHGHospital() {
  //   let userData = this.userData;
  //   if (userData && userData.length > 0) this.groupHospital = userData[0].hospital.map(x => x.id)
  //   let newData = this.carers.filter(element => this.groupHospital.includes(element.hospital['id']))
  //   this.carers = [...newData]
  //   // console.log('carers :: ', this.carers)
  // }
  setCHGHospital(arryName) {
    let userData = this.userData;
    console.log("this userData", this.userData);
    this.patientdata = arryName;
    if (userData && userData.length > 0)
      this.groupHospital = userData[0].hospital.map((x) => x.id);
    let newData = this.patientdata.filter((element) =>
      this.groupHospital.includes(element.hospital["id"])
    );
    this.patientdata = [...newData];
    this.getBarChartData("roc_drink");
    this.getBarChartData("roc_eat");
    this.getBarChartData("roc_holistic");
    this.chartDataCount1("patients", this.patientdata);
  }
  getCarerData(dataName: string, callbackFnName?: string) {
      let func;
      let refKeyAr = ["hospital", "care_home"];
      console.log("this.loggedInManager", this.loggedInManager);
      if (
        this.loggedInManager &&
        this.loggedInManager.hospital &&
        this.loggedInManager.hospital.id !== ""
      ) {
        func = this.rocService.getUserByWhereRef(
          dataName,
          "hospital",
          this.loggedInManager.hospital.id,
          "hospitals",
          refKeyAr
        );
      } else {
        func = this.rocService.getUserWithRef(dataName, refKeyAr);
      }
      this.unsub$[++this.subNum] = func.subscribe(
        (data) => {
          if (data) {
            console.log("getChartData===========");
            data.sort(
              (a, b) =>
                new Date(b.user["created_at"]).getTime() -
                new Date(a.user["created_at"]).getTime()
            );
            data.map((x) => {
              (x.email = x.user["email"]),
                (x.created_byTm =
                  x.created_by["name"] + " / " + x.created_by["role"].label);
            });
            if (this.currentRole == "carehome-manager") {
              this.arrayFilter = data.filter((x) => {
                return x.care_home["id"] == this.carehomeData[0].id;
              });
              this[dataName] = this.arrayFilter;
              console.log("this.arrayFilter---", this.arrayFilter);
            }
            if (this.currentRole == "chm-group") {
              // console.log('hereeeeee.....');
              console.log("this.currentUser[0].uid", this.currentUser);
              this.unsub$[++this.subNum] = this.rocService
                .getUserByWhere("chm_group", "user.uid", this.currentUser.uid)
                .subscribe((res: any) => {
                  if (res && res.length > 0) this.userData = [...res];
                  console.log("getChartData===========");
                  this[dataName] = data;
                  // this.setCHGHospital()
                });
            } else {
              console.log("superadmin.......");

              // this[dataName] = data;
              this[dataName] = data;
              console.log("data====>", data);
            }
            //  console.log('this[callbackFnName]', this[callbackFnName]);
            console.log("carer======", this[dataName]);
            callbackFnName && typeof this[callbackFnName] === "function"
              ? this[callbackFnName](this[dataName])
              : null;
          }
        },
        (err) => console.log(err)
      );
  }
  getDataForManager(uid: any): any {
    this.unsub$[++this.subNum] = this.rocService
      .getUserByWhereHL("carehome_manager", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
        console.log("this.loggedInManager", this.loggedInManager);
      });
  }

  getDataForAdmin(uid: any, collection: string, id: string): any {
    this.unsub$[++this.subNum] = this.rocService
      .getUserByWhereHL(collection, id, uid)
      // .getUserByWhereHL("roc_admin", "user.uid", uid)
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

  getConcernedPatients(userType: String) {
    
    this.unsub$[++this.subNum] = this.rocService
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
          // var c = 0;
          // var groupByArray = (xs, key) => {
          //   return xs.reduce(function (rv, x) {
          //     let v = key instanceof Function ? key(x) : x[key];
          //     let el = rv.find((r) => r && r.key === v);
          //     if (el) {
          //       el.values.push(x);
          //     } else {
          //       rv.push({
          //         key: v,
          //         values: [x],
          //       });
          //     }
          //     return rv;
          //   }, []);
          // };
          // this.concernCount = groupByArray(
          //   this.acknoledgementDoc,
          //   "patientId"
          // );
        }
        
    });
  }

  getPatient(dataName: string, callbackFnName?: string, hospitalId?: string) {
    console.log("getPatient from dashboard");

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
    } else {
      if (this.currentRole == "nurse") {
        func = this.rocService.getUserByWhereRef(
          dataName,
          "carer_id",
          this.carerData["id"],
          "carers",
          refKeyAr
        );
      } else if (this.currentRole == "carehome-manager") {
        console.log(
          "🚀 ~ file: dashboard.component.ts ~ line 524 ~ PageDashboardComponent ~ getPatient ~ this.carehomeData[0]",
          this.carehomeData[0]
        );
        if (this.carehomeData && this.carehomeData[0]) {
          let hospId = this.carehomeData[0]["hospital"].id;
          func = this.rocService.getUserByWhereRef(
            dataName,
            "hospital",
            hospId,
            "hospitals",
            refKeyAr
          );
        }
      }
    }
    // if(this.unsubscribePT) {
      this.unsub$[++this.subNum] = func.subscribe(
      data => {
        if (data) {
          this.patientdatalength = data.length
        }
      },
      err => console.log(err)
    );
    // }
  }

  getLanguage(coll) {
    this.unsub$[++this.subNum] = this.rocService
      .getUser(coll)
      .subscribe((res) => {
        if (res) {
          console.log("getChartData===========");
          this.labelData = res[0].language;
        }
      });
  }

  getCronData(dataName: string) {
    this.areaRocDrink = [];
    this.areaRocEat = [];
    this.areaRocHolistic = [];
    this.dataForChart = [];
    this.unsub$[++this.subNum] = this.rocService
      .getCronData(dataName, "time")
      .subscribe((data) => {
        // console.log('data',data);
        console.log("getChartData===========");
        data = data.reverse();
        // console.log('data reverse',data);
        if (data && data.length)
          data.map((x) => {
            // console.log('x',x);
            var i = 1;
            // console.log('day number', new Date().setDate(new Date(x.time).getDate()));

            // console.log('x.time', this.days[new Date(new Date().setDate(new Date(x.time).getDate()-1)).getDay()]);

            // this.dataForChart.push(this.days[(new Date(x.time).getDay())])
            // this.dataForChart.push(this.days[new Date(new Date().setDate(new Date(x.time).getDate() - 1)).getDay()]);
            this.dataForChart.push(
              this.days[
                new Date(
                  new Date().setDate(new Date(x.time).getDate() - 1)
                ).getDay()
              ]
            );
            console.log("dataForChart ", this.dataForChart);
            if (x.roc_drink) {
              this.areaRocDrink.push(x.roc_drink);
            }
            if (x.roc_eat) {
              this.areaRocEat.push(x.roc_eat);
            }
            if (x.roc_holistic) {
              this.areaRocHolistic.push(x.roc_holistic);
            }
            i++;
          });
        console.log("this areaRocHolistic ", this.areaRocHolistic);
        this.setChartData(this.areaRocDrink, "areaRocDrinkSeries", 0);
        this.setChartData(this.areaRocEat, "areaRocEatSeries", 1);
        this.setChartData(this.areaRocHolistic, "areaRocHolisticSeries", 2);
      });
  }

  setChartData(asmtAry, optionAry, index) {
    let arr = ["Red", "Orange", "Green"];
    for (let i = 0; i < arr.length; i++) {
      this[optionAry].push({
        type: "line",
        stack: "counts",
        areaStyle: { normal: {} },
        data: asmtAry.map((x) => x[arr[i]]),
      });
    }

    let some = "areaOptions" + index;
    this[some] = {
      color: ["red", "orange", "green"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      legend: {
        data: ["X-1", "X-2", "X-3", "X-4", "X-5"],
      },
      grid: {
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          data: this.dataForChart,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],

      series: this[optionAry],
    };
    console.log("this areaRocDrinkSeries", this[optionAry]);
  }

  getROC(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService
      .getUser(dataName)
      .subscribe((data) => {
        console.log("this rocdata", data);
        if (data && data.length) this.rocdata = [...data];
      });
  }

  getCH(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService
      .getUser(dataName)
      .subscribe((data) => {
        console.log("this chdata", data);
        if (data && data.length) this.CHdata = [...data];
      });
  }

  getCarers(dataName: string) {
    if (this.userRole == "carehome-manager") {
      this.filterDataByUser(
        "carehome_manager",
        "carers",
        "care_home",
        "carerdata"
      );
    } else {
      this.unsub$[++this.subNum] = this.rocService
        .getUser(dataName)
        .subscribe((data) => {
          if (data && data.length) {
            console.log("this carerdata===========", this.carerdata);
            this.carerdata = [...data];
          }
        });
    }
  }

  getPatients(dataName: string) {
    if (this.userRole == "carehome-manager") {
      this.filterDataByUser(
        "carehome_manager",
        "patients",
        "care_home",
        "patientdata"
      );
    } else if (this.userRole == "nurse") {
      this.filterDataByUser("carers", "patients", "carer_id", "patientdata");
    } else if (this.userRole == "chm-group") {
      // this.getChartData('patients');
      this.unsub$[++this.subNum] = this.rocService
        .getUser(dataName)
        .subscribe((data) => {
          if (data && data.length) {
            console.log("this.patientdata===========", data);
            this.patientdata = [...data];
            this.setCHGHospital(this.patientdata);
            this.getChartData("patients");
          }
        });
    } else {
      this.unsub$[++this.subNum] = this.rocService
        .getUser(dataName)
        .subscribe((data) => {
          console.log("this.patientdata===========", data);
          if (data && data.length) {
            this.patientdata = [...data];
            this.getChartData("patients");
          }
        });
    }
  }

  filterDataByUser(dataName, coll, userid, arrayName) {
    console.log("filterDataByUser", dataName, coll, userid, arrayName)
    let refKeyAr = ["hospital"];
    this.unsub$[++this.subNum] = this.rocService
      .getPatientByIdRole(dataName, "user.uid", refKeyAr)
      .subscribe((res) => {
        if (res) {
          console.log("getChartData===========", res);
          let filterId = res[0].id;
          this.unsub$[++this.subNum] = this.rocService
            .getUserByWhereRef(coll, userid, filterId, dataName)
            .subscribe((res) => {
              if (res) {
                console.log("getChartData===========");
                this[arrayName] = [...res];
                console.log("patients", res);
              }
              this.lastData = this.patientdata.filter((x) => {
                if (x.last_assessmentTime && x.is_active == true) return true;
              });
              this.lastData.map((x) => {
                (x["assessment"] = {
                  eat: x.eat ? x.eat : "",
                  drink: x.drink ? x.drink : "",
                  holistic: x.holistic ? x.holistic : "",
                }),
                  (x["lastTime"] = new Date(
                    x.last_assessmentTime
                  ).toLocaleString());
              });
              this.lastData.sort(
                (a: any, b: any) =>
                  b.last_assessmentTime - a.last_assessmentTime
              );
              console.log("this.lastData=======", this.lastData);
              let pd = this.patientdata;
              pd.filter((x, i) => {
                // if (!x.msg) {
                console.log("=========>>>>>>>>", x);
                this.dueData.push(x);
                // }
              });
              this.getChartData("patients");
            });
        }
      });
  }

  getBarChartData(dataName) {
    if (this.userRole == "roc-admin" || this.userRole == "super-admin") {
      this.unsub$[++this.subNum] = this.rocService
        .getUser(dataName)
        .subscribe((res) => {
          if (res) {
            console.log("getBarChartData===========");
            let arrayFilter = [...res];
            let somewhere = arrayFilter.filter((x) =>
              this.patientdata.find(
                (y) => y.id == x.patient_id.id && y.is_active
              )
            );
            this.bar_ChartDataCount(dataName, somewhere);
          }
        });
    } else if (this.userRole == "chm-group") {
      this.unsub$[++this.subNum] = this.rocService
        .getUser(dataName)
        .subscribe((res) => {
          if (res) {
            console.log("getBarChartData===========");
            let arrayFilter = [...res];
            let somewhere = arrayFilter.filter((x) =>
              this.patientdata.find(
                (y) => y.id == x.patient_id.id && y.is_active
              )
            );
            this.bar_ChartDataCount(dataName, somewhere);
          }
        });
    } else if (this.userRole == "nurse") {
      this.unsub$[++this.subNum] = this.rocService
        .getPatientByIdRole("carers", "user.uid")
        .subscribe((res) => {
          if (res && res.length) {
            console.log("getBarChartData===========");
            var hospitalId = res[0]["hospital"].id;
            if (hospitalId) {
              this.unsub$[++this.subNum] = this.rocService
                .getUserByWhereRef(
                  "patients",
                  "hospital",
                  hospitalId,
                  "hospitals"
                )
                .subscribe((res) => {
                  if (res) {
                    console.log("getChartData===========");
                    let patientData = res;
                    this.unsub$[++this.subNum] = this.rocService
                      .getUser(dataName)
                      .subscribe((res) => {
                        if (res) {
                          console.log("getChartData===========");
                          let allData = res;
                          let somewhere = allData.filter((x) =>
                            patientData.find(
                              (y) => y.id == x.patient_id.id && y.is_active
                            )
                          );
                          this.bar_ChartDataCount(dataName, somewhere);
                        }
                      });
                  }
                });
            } else {
              let nurse_id = res[0].id;
              this.unsub$[++this.subNum] = this.rocService
                .getUserByWhereRef("patients", "carer_id", nurse_id, "carers")
                .subscribe((res) => {
                  if (res) {
                    console.log("getChartData===========");
                    let patientData = res;
                    this.unsub$[++this.subNum] = this.rocService
                      .getUser(dataName)
                      .subscribe((res) => {
                        if (res) {
                          console.log("getChartData===========");
                          let allData = res;
                          let somewhere = allData.filter((x) =>
                            patientData.find(
                              (y) => y.id == x.patient_id.id && y.is_active
                            )
                          );
                          this.bar_ChartDataCount(dataName, somewhere);
                        }
                      });
                  }
                });
            }
          }
        });
    } else if (this.userRole == "carehome-manager") {
      this.unsub$[++this.subNum] = this.rocService
        .getPatientByIdRole("carehome_manager", "user.uid")
        .subscribe((res) => {
          if (res && res.length) {
            console.log("getBarChartData===========");
            let ch_id = res[0].id;
            this.unsub$[++this.subNum] = this.rocService
              .getUserByWhereRef(
                "patients",
                "care_home",
                ch_id,
                "carehome_manager"
              )
              .subscribe((res) => {
                if (res) {
                  console.log("getChartData===========");
                  let patientData = res;
                  this.unsub$[++this.subNum] = this.rocService
                    .getUser(dataName)
                    .subscribe((res) => {
                      if (res) {
                        console.log("getChartData===========");
                        let allData = res;
                        let somewhere = allData.filter((x) =>
                          patientData.find(
                            (y) => y.id == x.patient_id.id && y.is_active
                          )
                        );
                        this.bar_ChartDataCount(dataName, somewhere);
                      }
                    });
                }
              });
          }
        });
    }
  }
  getChartData(dataName) {
    if (this.userRole == "roc-admin" || this.userRole == "super-admin") {
      this.unsub$[++this.subNum] = this.rocService
        .getUserByWhere(dataName, "is_active", true)
        .subscribe((res) => {
          if (res) {
            console.log("getChartData===========");
            let arrayName = [...res];
            this.chartDataCount1(dataName, arrayName);
          }
        });
    } else if (this.userRole == "chm-group") {
      this.unsub$[++this.subNum] = this.rocService
        .getUserByWhere(dataName, "is_active", true)
        .subscribe((res) => {
          if (res) {
            console.log("getChartData===========");
            let arrayName = [...res];
            this.unsub$[++this.subNum] = this.rocService
              .getUserByWhere("chm_group", "user.uid", this.currentUser.uid)
              .subscribe((res: any) => {
                if (res && res.length > 0) this.userData = [...res];
                console.log("getChartData===========");
                // this[dataName] = this.patients;
                this.setCHGHospital(arrayName);
              });
          }
        });
    } else if (this.userRole == "nurse") {
      this.unsub$[++this.subNum] = this.rocService
        .getPatientByIdRole("carers", "user.uid")
        .subscribe((res) => {
          if (res && res.length) {
            console.log("getChartData===========");
            var hospitalId = res[0]["hospital"].id;
            if (hospitalId) {
              this.unsub$[++this.subNum] = this.rocService
                .getUserByWhereRef(
                  dataName,
                  "hospital",
                  hospitalId,
                  "hospitals"
                )
                .subscribe((res) => {
                  if (res) {
                    console.log("getChartData===========");
                    let arrayName = [...res];
                    let somewhere = arrayName.filter(
                      (x) => x.is_active == true
                    );
                    this.chartDataCount1(dataName, somewhere);
                  }
                });
            } else {
              let carer_id = res[0].id;
              this.unsub$[++this.subNum] = this.rocService
                .getUserByWhereRef(dataName, "carer_id", carer_id, "carers")
                .subscribe((res) => {
                  if (res) {
                    console.log("getChartData===========");
                    // console.log('res nurse', res)
                    let arrayName = [...res];
                    let somewhere = arrayName.filter(
                      (x) => x.is_active == true
                    );
                    this.chartDataCount1(dataName, somewhere);
                  }
                });
            }
          }
        });
    } else if (this.userRole == "carehome-manager") {
      this.unsub$[++this.subNum] = this.rocService
        .getPatientByIdRole("carehome_manager", "user.uid")
        .subscribe((res) => {
          if (res && res.length) {
            console.log("getChartData===========");
            let ch_id = res[0].id;
            this.unsub$[++this.subNum] = this.rocService
              .getUserByWhereRef(
                "patients",
                "care_home",
                ch_id,
                "carehome_manager"
              )
              .subscribe((res) => {
                if (res) {
                  console.log("getChartData===========");
                  let arrayName = [...res];
                  let somewhere = arrayName.filter((x) => x.is_active == true);
                  this.chartDataCount1(dataName, somewhere);
                }
              });
          }
        });
    }
  }

  bar_ChartDataCount(coll, ary) {
    // console.log("coll:",coll,"Aryy",ary)
    ary.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    let newAry = _.uniqBy(ary, "patient_id");
    // console.log("new array:",newAry)
    this.getChartValue(newAry, coll);
  }

  getChartValue(data, coll) {
    let arrayTobeMap = data;

    let patientDataRevers = _.uniqBy(
      _.orderBy(arrayTobeMap, "created_at", "desc"),
      "patient_id.id"
    );
    let areaRocDrinkData = [];
    patientDataRevers.forEach(function (item) {
      areaRocDrinkData.push(item);
    });

    let swallowAry = areaRocDrinkData.map((obj) => obj.Swallow);
    let assistAry = areaRocDrinkData.map((obj) => obj.Assist);
    let encourageAry = areaRocDrinkData.map((obj) => obj.Encourage);
    let recognition = areaRocDrinkData.map((obj) => obj.Recognition);
    // let swallowAry = arrayTobeMap.map(obj => obj.Swallow)
    // let assistAry = arrayTobeMap.map(obj => obj.Assist)
    // let encourageAry = arrayTobeMap.map(obj => obj.Encourage)

    if (coll === "roc_holistic") {
      let hearingAry = areaRocDrinkData.map((obj) => obj.Hearing);
      let visionAry = areaRocDrinkData.map((obj) => obj.Vision);
      let speechAry = areaRocDrinkData.map((obj) => obj.Speech);
      //let recongitionAry = areaRocDrinkData.map(obj => obj.Recongition)
      this.percentageCounting(hearingAry, "hearing", coll);
      this.percentageCounting(visionAry, "vision", coll);
      this.percentageCounting(speechAry, "speech", coll);
      this.percentageCounting(recognition, "recongition", coll);
    } else {
      this.percentageCounting(swallowAry, "swallow", coll);
      this.percentageCounting(assistAry, "assist", coll);
      this.percentageCounting(encourageAry, "encourage", coll);
      this.percentageCounting(recognition, "recongition", coll);
    }
  }

  percentageCounting(mapArray, aryName, coll) {
    var obj = {};
    mapArray.forEach(function (item) {
      if (typeof obj[item] == "number") {
        obj[item]++;
      } else {
        obj[item] = 1;
      }
    });
    Object.keys(obj).map(function (item) {
      return item + (obj[item] == 1 ? "" : 0 + obj[item]);
    });
    let totalCount =
      (obj["Red"] ? obj["Red"] : 0) +
      (obj["Green"] ? obj["Green"] : 0) +
      (obj["Orange"] ? obj["Orange"] : 0);
    this[aryName] = [
      obj["Green"] ? ((obj["Green"] * 100) / totalCount).toFixed(2) : 0,
      obj["Orange"] ? ((obj["Orange"] * 100) / totalCount).toFixed(2) : 0,
      obj["Red"] ? ((obj["Red"] * 100) / totalCount).toFixed(2) : 0,
    ];

    if (coll === "roc_drink") {
      // console.log("Drink Start")
      // console.log(this.swallow[0])
      // console.log(this.swallow[1])
      // console.log(this.swallow[2])
      // console.log("Drink End")
      this.barChartDataDrink = [
        { data: [this.swallow[0], this.assist[0], this.encourage[0], 0] },
        { data: [this.swallow[1], this.assist[1], this.encourage[1], 0] },
        { data: [this.swallow[2], this.assist[2], this.encourage[2], 0] },
      ];
    }
    if (coll === "roc_eat") {
      this.barChartDataEat = [
        { data: [this.swallow[0], this.assist[0], this.encourage[0], 0] },
        { data: [this.swallow[1], this.assist[1], this.encourage[1], 0] },
        { data: [this.swallow[2], this.assist[2], this.encourage[2], 0] },
      ];
    }
    if (coll === "roc_holistic") {
      this.barChartDataHolistic = [
        {
          data: [
            this.hearing[0],
            this.vision[0],
            this.speech[0],
            this.recongition[0],
            0,
          ],
        },
        {
          data: [
            this.hearing[1],
            this.vision[1],
            this.speech[1],
            this.recongition[1],
            0,
          ],
        },
        {
          data: [
            this.hearing[2],
            this.vision[2],
            this.speech[2],
            this.recongition[2],
            0,
          ],
        },
      ];
    }
  }
  chartDataCount1(coll, ary) {
    // console.log("coll:",coll)
    // console.log('ary',ary)
    let roc_drink = [];
    let roc_eat = [];
    let roc_holistic = [];
    ary.map((y) => {
      if (y.drink) {
        roc_drink.push(y.drink);
      }
      if (y.eat) {
        roc_eat.push(y.eat);
      }
      if (y.holistic) {
        roc_holistic.push(y.holistic);
      }
      this.countChartData(roc_drink, "roc_drink");
      this.countChartData(roc_eat, "roc_eat");
      this.countChartData(roc_holistic, "roc_holistic");
    });
    this.drink_number = roc_drink.length;
    this.eat_number = roc_eat.length;
    this.holistic_number = roc_holistic.length;
  }

  countChartData(arrayTobeMap, aryName) {
    // console.log("Ary to be mapped",a1)
    // this.num_asmt = arrayTobeMap
    if (aryName == "roc_drink") {
      this.rocDrink = arrayTobeMap.length + this.rocDrink;
    }
    if (aryName == "roc_eat") {
      this.rocEat = arrayTobeMap.length + this.rocEat;
    }
    if (aryName == "roc_holistric") {
      this.rocHolistic = arrayTobeMap.length + this.rocHolistic;
    }
    var obj = {};

    arrayTobeMap.forEach(function (item) {
      if (typeof obj[item] == "number") {
        // console.log('obj[item]',obj[item])
        obj[item]++;
      } else {
        obj[item] = 1;
      }
    });

    Object.keys(obj).map(function (item) {
      return item + (obj[item] == 1 ? "" : 0 + obj[item]);
    });

    let totalCount =
      (obj["Red"] ? obj["Red"] : 0) +
      (obj["Green"] ? obj["Green"] : 0) +
      (obj["Orange"] ? obj["Orange"] : 0);

    this[aryName] = [
      obj["Green"] ? +((obj["Green"] * 100) / totalCount).toFixed(2) : 0,
      obj["Orange"] ? +((obj["Orange"] * 100) / totalCount).toFixed(2) : 0,
      obj["Red"] ? +((obj["Red"] * 100) / totalCount).toFixed(2) : 0,
    ];

    let temp = this[aryName];
    temp.map((x, i) => {
      let c = temp[0] + temp[1] + temp[2];
      if (c > 100) {
        let d = c - 100;
        temp[0] = +(temp[0] - d).toFixed(2);
      }
    });
    this[aryName] = temp;
    // console.log(this[aryName],"aryyyy")
  }

  ngOnDestroy() {
    console.log(this.subNum);
    super.ngOnDestroy();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
    // this.dueUnsubscribe.unsubscribe();
  }

  setHSOptions() {
    this.hsOptions = {
      color: ["#ed5564", "#336cfb"],
      tooltip: {
        trigger: "none",
        axisPointer: {
          type: "cross",
        },
      },
      legend: {
        data: ["Patients 2018", "Patients 2019"],
      },
      grid: {
        left: 30,
        right: 0,
        top: 50,
        bottom: 50,
      },
      xAxis: [
        {
          type: "category",
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: "#336cfb",
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return (
                  "Patients " +
                  params.value +
                  (params.seriesData.length
                    ? "：" + params.seriesData[0].data
                    : "")
                );
              },
            },
          },
          data: [
            "2019-1",
            "2019-2",
            "2019-3",
            "2019-4",
            "2019-5",
            "2019-6",
            "2019-7",
            "2019-8",
            "2019-9",
            "2019-10",
            "2019-11",
            "2019-12",
          ],
        },
        {
          type: "category",
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: "#ed5564",
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return (
                  "Patients " +
                  params.value +
                  (params.seriesData.length
                    ? "：" + params.seriesData[0].data
                    : "")
                );
              },
            },
          },
          data: [
            "2018-1",
            "2018-2",
            "2018-3",
            "2018-4",
            "2018-5",
            "2018-6",
            "2018-7",
            "2018-8",
            "2018-9",
            "2018-10",
            "2018-11",
            "2018-12",
          ],
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "Patients 2018",
          type: "line",
          xAxisIndex: 1,
          smooth: true,
          data: [159, 149, 174, 182, 219, 201, 175, 182, 119, 118, 112, 96],
        },
        {
          name: "Patients 2019",
          type: "line",
          smooth: true,
          data: [95, 124, 132, 143, 138, 178, 194, 211, 234, 257, 241, 226],
        },
      ],
    };
  }

  setPIOptions() {
    this.piOptions = {
      color: ["#ed5564"],
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        boundaryGap: false,
        type: "category",
      },
      yAxis: {
        show: false,
      },
      series: [
        {
          name: "Patients 2019",
          type: "line",
          smooth: true,
          data: [95, 124, 132, 143, 138, 178, 194, 211, 234, 257, 241, 226],
          areaStyle: {},
        },
      ],
    };
  }

  setHEOptions() {
    this.heOptions = {
      color: ["#64B5F6"],
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        boundaryGap: false,
        type: "category",
      },
      yAxis: {
        show: false,
      },
      series: [
        {
          name: "Patients 2019",
          type: "line",
          smooth: true,
          data: [94, 111, 90, 85, 70, 83, 94, 109, 89, 74, 83, 78],
          areaStyle: {},
        },
      ],
    };
  }
}
