import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { BasePageComponent } from "../../base-page";
import { IAppState } from "../../../interfaces/app-state";
import { HttpService } from "../../../services/http/http.service";
import * as PageActions from "../../../store/actions/page.actions";
import { Content } from "../../../ui/interfaces/modal";
import { TCModalService } from "../../../ui/services/modal/modal.service";
import { RocadminService } from "src/app/services/generalService/rocadmin.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Subject, Subscription, combineLatest } from "rxjs";
import * as _ from "lodash";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { map } from "rxjs/operators";
import { AngularFirestore } from "@angular/fire/firestore";
import Swal from "sweetalert2";
import { async } from "@angular/core/testing";
import { IloggedInManager } from "src/app/interfaces/actions";
import { IUserData } from "src/app/interfaces/dashboard";
import { ICurrentUser } from 'src/app/interfaces/patient';
import { IAcknoledgedData, IAcknoledgementDoc } from "src/app/interfaces/dashboard";

@Component({
  selector: "page-actions",
  templateUrl: "./actions.component.html",
  styleUrls: ["./actions.component.scss"],
})
export class PageActionsComponent
  extends BasePageComponent
  implements OnInit, OnDestroy
{
  currentUser: ICurrentUser[] = [];
  currentRole: string;
  unsubscribePT: Subscription;
  modelFeedback: string = "";
  disabledDate = (current: Date): boolean => {
    return new Date(current) > new Date();
  };
  acknoledgedData: IAcknoledgedData[] = [];
  acknoledgementDoc: IAcknoledgementDoc[] = [];
  // patientInfo: any;
  loggedInManager: IloggedInManager;
  unsub$: Subscription[] = [];
  subNum: number = 0;
  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    public modal: TCModalService,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public firestore: AngularFirestore
  ) {
    super(store, httpSv);

    // this.pageData = {
    //   title: "",
    //   breadcrumbs: [
    //     {
    //       title: "ROC",
    //       route: "/default-dashboard",
    //     },
    //     {
    //       title: "Patients",
    //       route: "/patients",
    //     },
    //   ],
    // };
  }
  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit() {
    super.ngOnInit();
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe(
      async (res: ICurrentUser[]) => {
        if (res && res.length) {
          console.log("this.currentUser", res, this.currentUser)
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
  getAcknowledgementsAdmin(uid: any): any {
    this.unsub$[++this.subNum] = this.rocService
      .getUserByWhereHL("roc_admin", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
        this.getAcknowledgements("roc-admin");
      });
  }
  getAcknowledgementsManager(uid: any): any {
    this.unsub$[++this.subNum] = this.rocService
      .getUserByWhereHL("carehome_manager", "user.uid", uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loggedInManager = res[0];
        this.getAcknowledgements("carehome-manager");
      });
  }
  getAcknowledgements(userType: string) {
    console.log("this currentUser", this.loggedInManager);
    this.unsub$[++this.subNum] = this.rocService
      .getAllwithPopWithoutField("roc_acknowledgements")
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (resut: any) => {
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
            console.log("this acknowledge", this.acknoledgementDoc)
            this.store.dispatch(new PageActions.Update({ loaded: true }));
          }
          
      });
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  updateModal<T>(body: Content<T>, header: Content<T> = null, value?) {
    if (value && value.trim() != "") {
      this.modelFeedback = value;
    } else {
      this.modelFeedback = "N/A";
    }
    this.modal.open({
      body: body,
      header: header,
      closeButton: true,
    });
  }
  // close modal window
  closeModal() {
    this.modal.close();
  }

  transformDate(value) {
    let localDt = new Date(value).toLocaleString();
    let tempDt = localDt.split(":", 2);
    return tempDt[0] + ":" + tempDt[1];
  }

  onSwitch(data: any) {
    console.log(
      "🚀 ~ file: actions.component.ts ~ line 160 ~ onSwitch ~ data",
      data
    );
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      backdrop: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: text } = await Swal.fire({
          input: "textarea",
          inputLabel: "Feedback",
          inputPlaceholder: "Type your feedback here...",
          backdrop: false,
          inputAttributes: {
            "aria-label": "Type your feedback here",
          },
          showCancelButton: false,
          confirmButtonText: "Submit",
        });

        if (text) {
          this.storedata(data, text);
        }
      } else {
        document.getElementById(data.id).setAttribute("checked", "false");
        document.getElementById(data.id).classList.remove("checked");
      }
    });
  }
  storedata(data: any, text: any) {
    let dataObj = {
      isAcknowledged: !data.isAcknowledged,
      acknowledgedBy: this.firestore.doc(
        `/carehome_manager/${this.loggedInManager.id}`
      ).ref,
      acknowledgedAt: new Date().getTime(),
      remarks: text,
    };
    // setTimeout(() => {
    this.rocService.updateUser("roc_acknowledgements", dataObj, data.id).then(
      (res) => {
        this.generalService.showSuccess(data.notes, "Feedback Acknowledged!!");
      },
      (err) => {
        this.generalService.showError(err.message, "Error::");
      }
    );
    // }, 700);
  }
}
