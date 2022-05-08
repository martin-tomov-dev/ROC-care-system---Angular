import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Renderer2,
} from "@angular/core";

import { Store } from "@ngrx/store";

import { BasePageComponent } from "../../base-page";
import { IAppState } from "../../../interfaces/app-state";
import { HttpService } from "../../../services/http/http.service";
// import { IPatient } from '../../../interfaces/patient';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IOption } from "../../../ui/interfaces/option";
import { Content } from "../../../ui/interfaces/modal";
import * as PatientsActions from "../../../store/actions/patients.actions";
import { TCModalService } from "../../../ui/services/modal/modal.service";
import { RocadminService } from "src/app/services/generalService/rocadmin.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { IUserData } from "src/app/interfaces/dashboard";
import { IPatient, ICarehomeData, ICareData, IEntryPoint, IAssesment, ICurrentUser } from "src/app/interfaces/patient";
import { IHospital } from "src/app/interfaces/hospital";
import { Icu } from "@angular/compiler/src/i18n/i18n_ast";

@Component({
  selector: "page-patients",
  templateUrl: "./patients.component.html",
  styleUrls: ["./patients.component.scss"],
})
export class PagePatientsComponent
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
  patientForm: FormGroup;
  gender: IOption[];
  status: IOption[];
  currentAvatar: string | ArrayBuffer;
  defaultAvatar: string;
  currentUser: any;
  currentRole: string;
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

  selectedFile: File | null = null;
  changes: boolean;

  oldImgFile: any;
  hospitalPasser: boolean = false;

  unsub$: Subscription[] = [];
  subNum: number = 0;

  //onselect model
  hospital_model: string[] = [];
  carehome_model: string[] = [];
  carer_model: string[] = [];

  unsubscribePT: Subscription;
  groupHospital: any[] = [];
  userData: IUserData[] = [];
  adminPatientHospital: any;
  carehomeDataObj: any;
  totalBarValue: number;

  disabledDate = (current: Date): boolean => {
    return new Date(current) > new Date();
  };
  mainAvtar: string;
  current: string;

  constructor(
    store: Store<IAppState>,
    httpSv: HttpService,
    private fb: FormBuilder,
    public modal: TCModalService,
    public rocService: RocadminService,
    public generalService: GeneralService,
    public router: Router,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private translate: TranslateService
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
    this.patients = [];
    this.defaultAvatar = "assets/content/avatar.jpg";
    this.currentAvatar = this.defaultAvatar;
    this.mainAvtar = "assets/content/imgpsh_fullsize_anim.jpg";
    this.current = this.mainAvtar;
    this.unsub$[++this.subNum] = this.route.queryParams.subscribe((params) => {
      console.log("subscribe====");
      if (params["hid"]) {
        this.hosId = params["hid"];
        this.hospitalPasser = true;
        this.ngOnInit();
      }
    });
  }

  instakeStoreOnDB() {
    console.log("this patients instake ngoninit")
    // var dataObj = {
    //   date: new Date().getTime(),
    //   id: 9gorhvnoLDL2Rm00Ht0Z,
    //   intake: 444,
    // };
    // this.rocService.addRecord("log-store-intake", dataObj).then(
    //   (res) => {
    //     this.generalService.showSuccess(
    //       "Instake Values Successfully Added!!",
    //       ""
    //     );
    //     this.closeModal();
    //   },
    //   (err) => {
    //     console.log(err);
    //     this.generalService.showError(err.message, "");
    //   }
    // );
  }

  ngOnInit() {
    super.ngOnInit();
    this.instakeStoreOnDB();
    // localStorage.removeItem('patientClick');
    localStorage.removeItem("secondClick");
    // this.pointOfEntry("pointOf_entry");
    this.getPatientLeveldata("patient_level");
    this.unsub$[++this.subNum] = this.rocService.getUserRole().subscribe(
      (res) => {
        console.log("subscribe====");
        if (res && res.length) {
          this.currentUser = res;
          this.currentRole = this.currentUser[0].role["label"];

          if (
            this.currentRole === "roc-admin" ||
            this.currentRole === "super-admin"
          ) {
            this.unsub$[++this.subNum] = this.rocService.getUser("hospitals").subscribe((res) => {
              console.log("subscribe====");
              if (res && res.length) {
                this.hospitalData = res;
                this.hospitalData.map((x) => {
                  (x.value = x.id), (x.label = x.name);
                });
              }
            });
            this.getPatient("patients", "setLoaded", this.hosId);
          }
          else if (this.currentRole === "carehome-manager") {

            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("carehome_manager", "user.uid")
              .subscribe((res) => {
                console.log("subscribe====");
                if (res) {
                  this.carehomeData = res;
                }
                this.rocService
                  .getUserByWhereRef(
                    "carers",
                    "care_home",
                    this.carehomeData[0].id,
                    "carehome_manager"
                  )
                  .subscribe((res) => {
                    console.log("subscribe====");
                    if (res && res.length) {
                      this.carerData = res;
                      console.log("this carerData", this.carerData)
                      this.carerData.map((x) => {
                        (x.value = x.id), (x.label = x.fname);
                      });
                    }
                  });

                if (!this.hospitalPasser) {
                  let hospitalId = this.carehomeData[0].hospital.id;
                  this.getPatient("patients", "setLoaded", hospitalId);
                } else {
                  this.getPatient("patients", "setLoaded", this.hosId);
                }
              });
          }
          else if (this.currentRole === "chm-group") {
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("chm_group", "user.uid")
              .subscribe((res) => {
                console.log("subscribe====");
                if (res) {
                  this.carehomeData = res;
                  this.carehomeDataObj = this.carehomeData[0];
                }
                this.getPatient("patients", "setLoaded", this.hosId);
              });
          }
          else if (this.currentRole === "nurse") {
            this.unsub$[++this.subNum] = this.rocService
              .getPatientByIdRole("carers", "user.uid")
              .subscribe((res) => {
                console.log("subscribe====");
                if (res) {
                  this.carerData = res[0];
                  this.carehomeData = res;
                  this.getPatient(
                    "patients",
                    "setLoaded",
                    this.carerData["hospital"].id
                  );
                }
              });
          }
          if (this.currentRole === "chm-group") {
            this.getPatient("patients", "setLoaded", this.hosId);
          }
        }
      },
      (err) => {
        console.log("Err", err);
      }
    );

    this.unsub$[++this.subNum] = this.rocService.getUser("rocAdmin_settings").subscribe(
      (set) => {
        console.log("subscribe====");
        if (set && set.length > 0) {
          this.adminPatientHospital = set[0]["num_patients"];
          this.totalBarValue = set[0]["totalBar"];
        }
      },
      (err) => console.log(err)
    );
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
    console.log("this.patients=========", this.patients)
  }

  getPatient(dataName: string, callbackFnName?: string, hospitalId?: string) {
    console.log("this.currentRole", this.currentRole);
    let refKeyAr = ["hospital", "care_home", "carer_id", "chm_group"];
    let func;
    if (hospitalId) {
      console.log("hospitalId", hospitalId);
      func = this.rocService.getUserByWhereRef(
        dataName,
        "hospital",
        hospitalId,
        "hospitals",
        refKeyAr
      );
    } else {
      if (this.currentRole == "carehome-manager") {
        console.log("this.carehomeData[0].id", this.carehomeData[0].id);
        func = this.rocService.getUserByWhereRef(
          dataName,
          "care_home",
          this.carehomeData[0].id,
          "carehome_manager",
          refKeyAr
        );
      } else if (this.currentRole == "nurse") {
        console.log("this.carerData[0].id", this.carerData[0].id);
        func = this.rocService.getUserByWhereRef(
          dataName,
          "carer_id",
          this.carerData["id"],
          "carers",
          refKeyAr
        );
      } else {
        console.log("dataName", dataName);
        console.log("refKeyAr", refKeyAr);
        func = this.rocService.getUserWithRef(dataName, refKeyAr);
      }
    }
    this.unsub$[++this.subNum] = func.subscribe(
      (data) => {
        console.log("subscribe====");
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
                x["fullName"] = x.fname + " " + x.lname;
                x.dob = new Date(x.dob.seconds * 1000);
              }
            });
          if (this.currentRole == "chm-group") {
            this.unsub$[++this.subNum] = this.rocService
              .getUserByWhere("chm_group", "user.uid", this.currentUser[0].uid)
              .subscribe((res: any) => {
                console.log("subscribe====");
                if (res && res.length > 0) this.userData = [...res];
                this[dataName] = this.patients;
                this.setCHGHospital();
              });
          } else {
            arrayFilter.forEach((element, index, array) => {
              element.hospital.get().then((r, i) => {
                let x = r.data();
                if (x) {
                  array[index]["hospitalname"] = x.name;
                }
              });
            });
            this[dataName] = data;
            console.log('patients', data)
          }
          // setTimeout(() => {
          //   callbackFnName && typeof this[callbackFnName] === "function"
          //   ? this[callbackFnName](this[dataName])
          //   : null;
          // }, 500);
          callbackFnName && typeof this[callbackFnName] === "function"
            ? this[callbackFnName](this[dataName])
            : null;
        }
      },
      (err) => console.log(err)
    );
  }

  pointOfEntry(dataName: string) {
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe((data) => {
      console.log("subscribe====");
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
    this.unsub$[++this.subNum] = this.rocService.getUser(dataName).subscribe((data) => {
      console.log("subscribe====");
      if (data && data.length) {
        console.log("this assesmentData", data);
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

  getHospitalByIdPatients(dataName: string) {
    this.rocService.getUser(dataName).subscribe((data) => {
      console.log("subscribe====");
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

  getHostByWhere(dataName: string) {
    this.rocService.getUser(dataName).subscribe((data) => {
      console.log("subscribe====");
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
    if (this.unsubscribePT) this.unsubscribePT.unsubscribe();
    for (let index = 0; index < this.unsub$.length; index++) {
      if (this.unsub$[index]) this.unsub$[index].unsubscribe();
    }
  }

  goToProfile(pid) {
    this.router.navigate([`patient-profile/${pid}`]);
  }

  goToProfileUserFriendly(pid) {
    this.router.navigate([`user-profile/${pid}`]);
  }
  // delete patient
  remove(tableRow: any) {
    this.openModalDelete(
      "You want to delete Record?",
      "Are you sure?",
      this.modalDelete,
      tableRow
    );
  }

  openModalDelete(
    body: any,
    header: any = null,
    footer: any = null,
    data: any = null
  ) {
    this.deleteId = data.id;
    this.oldImgFile = data.photo;
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
    });
  }

  deleteOk() {
    this.rocService.deleteUser("patients", this.deleteId).then(
      (res) => {
        if (this.oldImgFile)
          this.storage.storage.refFromURL(this.oldImgFile).delete();
        this.generalService.showSuccess("Record Successfully Deleted!!", "");
        this.modal.close();
      },
      (err) => {
        console.log("ERR", err);
        this.generalService.showError(err.message, "");
      }
    );
  }

  // open modal window
  openModal<T>(
    body: Content<T>,
    header: Content<T> = null,
    footer: Content<T> = null,
    row
  ) {
    if (row) {
      this.isEdit = true;
      this.editId = row.id;
    } else {
      this.isEdit = false;
    }
    this.initPatientForm(row);
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
      options: null,
    });
  }

  updateModal<T>(
    body: Content<T>,
    header: Content<T> = null,
    footer: Content<T> = null,
    row
  ) {
    if (row) {
      this.isEdit = true;
      this.editId = row.id;
    } else {
      this.isEdit = false;
    }
    this.initPatientFormupdate(row);
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
      options: null,
    });
  }

  initPatientFormupdate(data?: any) {
    this.currentAvatar = data.photo ? data.photo : this.defaultAvatar;
    this.oldImgFile = data.photo ? data.photo : "";
    this.patientForm = this.fb.group({
      // ,this.editId ? [] : [Validators.required]
      photo: [""],
      fname: [
        data.fname ? data.fname : "",
        [
          Validators.required,
          Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$"),
        ],
      ],
      lname: [
        data.lname ? data.lname : "",
        [
          Validators.required,
          Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$"),
        ],
      ],
      // email: [data.email ? data.email : '', [Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      dob: [data.dob ? data.dob : "", Validators.required],
      gender: [data.gender ? data.gender : "", Validators.required],
      address: [data.address ? data.address : "", Validators.required],
      nhs_number: [data.nhs_number ? data.nhs_number : ""],
      // phone: [data.phone ? data.phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      // nextof_kin: [data.nextof_kin ? data.nextof_kin : '', [Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      // nextKin_phone: [data.nextKin_phone ? data.nextKin_phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      // reason: [data.reason ? data.reason : '', Validators.required],
      patient_level: [
        data.patient_level ? data.patient_level["value"] : this.defaultLevel,
        Validators.required,
      ],
      point_of_entry: [data.point_of_entry ? data.point_of_entry["value"] : ""],
      hospital: [
        data.care_home ? data["hospital"]["id"] : "",
        this.currentRole == "roc-admin" || this.currentRole == "super-admin"
          ? [Validators.required]
          : [],
      ],
      care_home: [
        data.care_home ? data["care_home"]["id"] : "",
        this.currentRole == "roc-admin" || this.currentRole == "super-admin"
          ? [Validators.required]
          : [],
      ],
      carer_id: [data.carer_id ? data["carer_id"]["id"] : ""],
    });
    if (data) {
      // setTimeout(() => {
        this.patientForm.patchValue({
          hospital: data["hospital"]["id"],
          care_home: data["care_home"]["id"],
          carer_id: data["carer_id"]["id"],
        });
      // }, 700);
    }
  }

  // close modal window
  closeModal() {
    this.modal.close();
    if (!this.isEdit) this.patientForm.reset();
    this.submitted = false;
  }

  onFileChanged(inputValue: any) {
    let file: File = inputValue.target.files[0];
    this.selectedFile = file;
    let reader: FileReader = new FileReader();
    reader.onloadend = () => {
      this.currentAvatar = reader.result;
      this.changes = true;
    };
    reader.readAsDataURL(file);
  }

  initPatientForm(data?: any) {
    this.currentAvatar = data.photo ? data.photo : this.defaultAvatar;
    this.oldImgFile = data.photo ? data.photo : "";
    this.patientForm = this.fb.group({
      // ,this.editId ? [] : [Validators.required]
      photo: [""],
      fname: [
        data.fname ? data.fname : "",
        [
          Validators.required,
          Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$"),
        ],
      ],
      lname: [
        data.lname ? data.lname : "",
        [
          Validators.required,
          Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$"),
        ],
      ],
      // email: [data.email ? data.email : '', [Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      dob: [data.dob ? data.dob : "", Validators.required],
      gender: [data.gender ? data.gender : "", Validators.required],
      address: [data.address ? data.address : "", Validators.required],
      nhs_number: [data.nhs_number ? data.nhs_number : ""],
      // phone: [data.phone ? data.phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      // nextof_kin: [data.nextof_kin ? data.nextof_kin : '', [Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      // nextKin_phone: [data.nextKin_phone ? data.nextKin_phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      // reason: [data.reason ? data.reason : '', Validators.required],
      patient_level: [
        data.patient_level ? data.patient_level["value"] : this.defaultLevel,
        Validators.required,
      ],
      point_of_entry: [data.point_of_entry ? data.point_of_entry["value"] : ""],
      hospital: [
        data.care_home ? data["hospital"]["id"] : "",
        this.currentRole == "roc-admin" || this.currentRole == "super-admin"
          ? [Validators.required]
          : [],
      ],
      care_home: [
        data.care_home ? data["care_home"]["id"] : "",
        this.currentRole == "roc-admin" || this.currentRole == "super-admin"
          ? [Validators.required]
          : [],
      ],
      carer_id: [data.carer_id ? data["carer_id"]["id"] : ""],
    });
    if (data) {
      // setTimeout(() => {
        this.patientForm.patchValue({
          hospital: data["hospital"]["id"],
          care_home: data["care_home"]["id"],
          carer_id: data["carer_id"]["id"],
        });
      // }, 700);
    }
  }
  // darshan
  initPatientFormSecondHostpital(data?: any) {
    this.currentAvatar = data.photo ? data.photo : this.defaultAvatar;
    this.oldImgFile = data.photo ? data.photo : "";
    this.patientForm = this.fb.group({
      // ,this.editId ? [] : [Validators.required]
      photo: [""],
      fname: [
        data.fname ? data.fname : "",
        [
          Validators.required,
          Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$"),
        ],
      ],
      lname: [
        data.lname ? data.lname : "",
        [
          Validators.required,
          Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$"),
        ],
      ],
      // email: [data.email ? data.email : '', [Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}")]],
      dob: [data.dob ? data.dob : "", Validators.required],
      gender: [data.gender ? data.gender : "", Validators.required],
      address: [data.address ? data.address : "", Validators.required],
      nhs_number: [data.nhs_number ? data.nhs_number : ""],
      // phone: [data.phone ? data.phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      // nextof_kin: [data.nextof_kin ? data.nextof_kin : '', [Validators.pattern("^(?!\\s)(?![^]*\\s$)[a-zA-Z\\s()-]+$")]],
      // nextKin_phone: [data.nextKin_phone ? data.nextKin_phone : '', [Validators.pattern("^[0-9\+]{8,13}$")]],
      // reason: [data.reason ? data.reason : '', Validators.required],
      patient_level: [
        data.patient_level ? data.patient_level["value"] : this.defaultLevel,
        Validators.required,
      ],
      point_of_entry: [data.point_of_entry ? data.point_of_entry["value"] : ""],
      hospital: [
        data.care_home ? data["hospital"]["id"] : "",
        this.currentRole == "roc-admin" || this.currentRole == "super-admin"
          ? [Validators.required]
          : [],
      ],
      care_home: [
        data.care_home ? data["care_home"]["id"] : "",
        this.currentRole == "roc-admin" || this.currentRole == "super-admin"
          ? [Validators.required]
          : [],
      ],
      carer_id: [data.carer_id ? data["carer_id"]["id"] : ""],
    });
    if (data) {
      // setTimeout(() => {
        this.patientForm.patchValue({
          hospital: data["hospital"]["id"],
          care_home: data["care_home"]["id"],
          carer_id: data["carer_id"]["id"],
        });
      // }, 700);
    }
  }

  // update patient
  updatePatient(value) {
    this.submitted = true;

    if (this.patientForm.invalid) {
      return;
    } else {
      if (this.isEdit) {
        let patientLevelObj =
          this.assessmentData &&
          this.assessmentData.find((x) => x.value == value.patient_level);
        let newPL = {
          label: patientLevelObj.label,
          value: patientLevelObj.value,
        };
        let pt_birthdate = value.dob;
        const bdate = new Date(pt_birthdate);
        const timeDiff = Math.abs(Date.now() - bdate.getTime());

        let age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
        var dataObj = {
          fname: value.fname,
          lname: value.lname,
          photo: value.photo,
          gender: value.gender,
          // "reason": value.reason,
          dob: value.dob,
          age: age,
          // "phone": value.phone,
          // "email": value.email,
          // "nextof_kin": value.nextof_kin,
          // "nextKin_phone": value.nextKin_phone,
          address: value.address,
          patient_level: newPL,
          updated_at:
            new Date().toDateString() + " " + new Date().toLocaleTimeString(),
        };
        if (this.selectedFile) this.imageFunction(dataObj);
        else this.updateServiceCalling(dataObj);
      } else {
        let mailObj = {};
        let carer_obj;
        let CH_obj;
        let hospital_obj;
        //hospital ref
        // if (value.hospital == '') {
        if (!!value.hospital == false) {
          if (this.currentRole == "carehome-manager") {
            value.hospital =
              this.carehomeData.length && this.carehomeData[0].hospital;
          } else if (this.currentRole == "chm-group") {
            value.hospital =
              this.carehomeData.length && this.carehomeData[0].hospital[0];
          } else {
            value.hospital = this.carerData && this.carerData["hospital"];
          }
        } else {
          hospital_obj =
            this.hospitalData &&
            this.hospitalData.find((c) => c.id == value.hospital);
          value.hospital = this.firestore.doc(
            `/hospitals/${hospital_obj.value}`
          ).ref;
        }
        //carehome ref
        //console.log("Darshan dsasadasdasdi")
        if (value.care_home == "") {
          if (this.currentRole == "carehome-manager") {
            CH_obj =
              this.carehomeData &&
              this.carehomeData.find((c) => c.id == this.carehomeData[0].id);
            value.care_home = this.firestore.doc(
              `/carehome_manager/${this.carehomeData[0].id}`
            ).ref;
          } else if (this.currentRole == "chm-group") {
            CH_obj =
              this.carehomeData &&
              this.carehomeData.find((c) => c.id == this.carehomeData[0].id);
            value.chm_group = this.firestore.doc(
              `/chm_group/${this.carehomeData[0].id}`
            ).ref;
          } else if (this.currentRole == "nurse") {
            CH_obj = this.curr_CHObj;
            value.care_home = this.carerData && this.carerData["care_home"];
          }
        } else {
          CH_obj =
            this.carehomeData &&
            this.carehomeData.find((c) => c.id == value.care_home);
          value.care_home = this.firestore.doc(
            `/carehome_manager/${value.care_home}`
          ).ref;
        }
        //carer ref
        if (value.carer_id == "") {
          if (
            this.currentRole == "carehome-manager" ||
            this.currentRole == "roc-admin" ||
            this.currentRole == "super-admin" ||
            this.currentRole == "chm-group"
          ) {
            carer_obj = {
              fname: "Not assigned yet",
              lname: "",
            };
          }
          if (this.currentRole == "nurse") {
            carer_obj = this.carerData;
            value.carer_id = this.firestore.doc(
              `/carers/${this.carerData["id"]}`
            ).ref;
          }
        } else {
          carer_obj =
            this.carerData &&
            this.carerData.find((c) => c.id == value.carer_id);
          value.carer_id = this.firestore.doc(`/carers/${value.carer_id}`).ref;
        }
        //console.log("Darshan dsasadasdasdi")
        // const dt = new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
        value.created_at = new Date().getTime();
        value.updated_at = null;
        value.is_deleted = false;
        value.is_active = true;
        value["created_by"] = this.currentUser[0];
        value["both_time"] = {
          last_assessment: null,
          last_updated: new Date().getTime(),
        };

        // let poeObj = this.entryPointData && this.entryPointData.find(c => c.value == value.point_of_entry)
        // let newPoe = {
        //   label: poeObj.label,
        //   value: poeObj.value
        // }
        // delete value.poeObj
        // value['point_of_entry'] = newPoe

        let patientLevelObj =
          this.assessmentData &&
          this.assessmentData.find((x) => x.value == value.patient_level);
        let newPL = {
          label: patientLevelObj.label,
          value: patientLevelObj.value,
        };
        value["patient_level"] = newPL;
        mailObj[
          "msg"
        ] = `<h2>Hello New patient is added in the system. Please find the following details.</h2>
        <h3>Name :</h3> ${value.fname} ${value.lname}
        <h3>Care Home manager :</h3> ${CH_obj ? CH_obj["fname"] : ""} ${
          CH_obj ? CH_obj["lname"] : ""
        }
        <h3>Nurse :</h3> ${CH_obj ? carer_obj["fname"] : ""} ${
          CH_obj ? carer_obj["lname"] : ""
        }
       `;
        if (CH_obj && CH_obj.id) {
          this.rocService
            .getUserById("carehome_manager", CH_obj.id)
            .subscribe((res: any) => {
              console.log("subscribe=====");
              if (res) this.CH_email = res["user"]["email"];
              mailObj["carehomeMail"] = this.CH_email;
            });
        }
        if (carer_obj.id) {
          this.rocService
            .getUserById("carers", carer_obj.id)
            .subscribe((res: any) => {
              console.log("subscribe=====");
              if (res) {
                this.nur_email = res["user"]["email"];
              }
              mailObj["nurseMail"] = this.nur_email;
            });
        }
        let pt_birthdate = value.dob;
        const bdate = new Date(pt_birthdate);
        // const dt = new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
        const timeDiff = Math.abs(Date.now() - bdate.getTime());
        value["age"] = Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
        if (this.selectedFile == undefined)
          this.addServiceCalling(value, mailObj);
        else this.imageFunction(value, mailObj);
      }
    }
  }

  imageFunction(value, mailObj?) {
    var n = Date.now();
    const filePath = `profileImages/${n}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`profileImages/${n}`, this.selectedFile);
    this.unsub$[++this.subNum] = task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe((url) => {
            console.log("subscribe=====");
            if (url) {
              value["photo"] = url;
              if (this.isEdit) this.updateServiceCalling(value);
              else this.addServiceCalling(value, mailObj);
            }
          });
        })
      )
      .subscribe((url) => {
        console.log("subscribe=====");
        if (url) {
          // console.log("URL:::",url)
        }
      });
  }

  addServiceCalling(value, mailObj) {
    this.rocService.addRecord("patients", value).then((res) => {
      this.generalService.showSuccess("Patient Successfully Added!!", "");
      this.closeModal();
      this.selectedFile = undefined;
      this.changes = false;
      this.sendmail(mailObj);
    });
  }

  updateServiceCalling(dataObj) {
    if (dataObj["photo"] == "") {
      dataObj["photo"] = this.oldImgFile;
    }
    let deleteUrl = this.oldImgFile;
    this.rocService.updateUser("patients", dataObj, this.editId).then(
      (res) => {
        if (this.changes && deleteUrl) {
          this.storage.storage.refFromURL(deleteUrl).delete();
        }
        this.generalService.showSuccess("Data Successfully Updated!!", "");
        this.selectedFile = undefined;
        this.changes = false;
        this.closeModal();
      },
      (err) => {
        console.log("ERR::", err);
        this.generalService.showError(err.message, "");
      }
    );
  }

  sendmail(data) {
    this.httpSv.sendMail(data).subscribe((res) => {});
  }

  onHospitalSelect(event) {
    this.carehome_model = [];
    this.carer_model = [];
    // const dt = new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
    this.rocService
      .getUserByWhereRef(
        "carehome_manager",
        "hospital",
        event.value,
        "hospitals"
      )
      .subscribe((res) => {
        console.log("subscribe=====");
        if (res && res.length) {
          this.carehomeData = res;
          this.carehomeData.map((x) => {
            (x.value = x.id), (x.label = x.fname + " " + x.lname);
          });
        }
      });
  }

  onCareHomeSelect(event) {
    this.carer_model = [];
    this.rocService
      .getUserByWhereRef("carers", "care_home", event.value, "carehome_manager")
      .subscribe((res) => {
        console.log("subscribe=====");
        if (res && res.length) {
          this.carerData = res;
          this.carerData.map((x) => {
            (x.value = x.id), (x.label = x.fname + " " + x.lname);
          });
        }
      });
  }

  get f() {
    return this.patientForm.controls;
  }
}
