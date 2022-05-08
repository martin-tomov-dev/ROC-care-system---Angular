import { AnonymousSubject } from "rxjs/internal/Subject";

interface ISettingdata {
  created_At: number;
  currency: string;
  hospital_id: string;
  id: string;
  is_active: boolean;
  movingavg: string;
  updated_At: number;
}
interface IRocdata {
  user: {
    email: string;
    uid: string;
    created_at: string;
  };
  lname: string;
  auth_token: string;
  created_by: {
    uid: string;
    name: string;
    role: {
      value: string;
      label: string;
    };
  };
  updated_at: string;
  facebook_authentication: string;
  google_authentication: string;
  role: {
    value: string;
    permission: any;
    label: string;
  };
  is_deleted: boolean;
  fname: string;
  id: string;
}
interface IChdata {
  phone: string;
  country: {
    label: string;
    value: string;
  };
  postcode: string;
  name: string;
  created_at: string;
  town: string;
  address1: string;
  updated_at: string;
  address: string;
  id: string;
}
interface IAreaRocDrink {
  num_asmt: number;
  Red: number;
  Orange: number;
  Green: number;
}
interface IRocDrinkSeries {
  type: string;
  stack: string;
  areaStyle: {
    normal: any;
  };
  data: number[];
}
interface IAreaRocEat {
  Green: number;
  Orange: number;
  Red: number;
  num_asmt: number;
}
interface IUserData {
  admin_id: {
    name: string;
    role: {
      label: string;
      value: string;
      uid: string;
    };
  };
  auth_token: string;
  by_admin: number;
  facebook_authentication: string;
  fname: string;
  google_authentication: string;
  hospital: any;
  id: string;
  is_deleted: boolean;
  lname: string;
  num_carers: string;
  num_chm: string;
  num_hospitals: string;
  num_patients: string;
  role: { value: string; label: string };
  updated_at: { nanoseconds: number; seconds: number };
  user: { created_at: string; uid: string; email: string };
}
interface IAcknoledgementDoc {
  Assist: string;
  Encourage: string;
  Swallow: string;
  acknowledgedAt: string;
  acknowledgedBy: string;
  asmt_type: string;
  assessment_by: { uid: string; role: any; name: string };
  assessment_time: number;
  date_time: string;
  date_time_of_record: number;
  deletedBy: string;
  feedback: string;
  id: string;
  img: string;
  intake_volume: number;
  isAcknowledged: boolean;
  isDeleted: boolean;
  name_who_submitted: string;
  notes: string;
  patientId: string;
  patient_id: {
    address: string;
    age: number;
    both_time: {
      "last_updated": number;
      "last_assessment": number;
    };
    care_home: any;
    carer_id: any;
    created_at: number;
    created_by: {
      name: string;
      role: any;
      uid: string;
    };
    dob: {
      nanoseconds: number;
      seconds: number;
    };
    drink: string;
    drink_time: number;
    email: string;
    fname: string;
    gender: string;
    hospital: {
      id: string;
      parent: any;
      path: string;
    };
    intake: number;
    is_active: boolean;
    is_deleted: boolean;
    last_assessmentTime: number;
    lname: string
    nextKin_phone: string;
    nextof_kin: string;
    nhs_number: string;
    patient_level: {
      label: string;
      value: string;
    };
    phone: string;
    photo: string;
    point_of_entry: {value: string; label: string};
    reason: string;
    updated_at: string;
  };
  rating: { score: number; color: string };
  remarks: string;
  type_of_drink: string;
}
interface IConcernCount {
  key: string;
  values: any[];
}
interface ICarer {
  care_home: string;
  created_by: { role: any; name: string; uid: string };
  created_byTm: string;
  cstatus: boolean;
  email: string;
  fname: string;
  hospital: any;
  id: string;
  is_deleted: boolean;
  lname: string;
  role: { value: string; permission: any; label: string };
  updated_at: string;
  user: {uid: string; email: string; created_at: string};
}
interface IHospitalData {
  address?: string;
  address1?: string;
  country?: { value: string; label: string };
  created_at?: string;
  id?: string;
  label: string;
  name?: string;
  phone?: string;
  postcode?: string;
  town?: string;
  updated_at?: string;
  value: string;
}
interface IBarChartOpinion {
  scaleShowVerticalLines: boolean;
  responsive: boolean;
  title: {
    fontFamily: string;
    fontSize: number;
    fontColor: string;
  };
}
interface IBarChartData {
  backgroundColor?: string;
  data: string[];
}
interface IBarChartColor {
  backgroundColor: string;
  pointHoverBackgroundColor: string;
}
interface IDueData {
  address: string;
  age: number;
  assessment: { eat: string; drink: string; holistic: string };
  both_time: { last_assessment: number; last_updated: number };
  care_home: any;
  carer_id: string;
  created_at: number;
  created_by: { uid: string; name: string; role: any };
  dob: { seconds: number; nanoseconds: number };
  drink: string;
  drink_time: number;
  eat: string;
  eat_time: number;
  fname: string;
  gender: string;
  holistic: string;
  holistic_time: number;
  hospital: any;
  id: string;
  intake: 0;
  is_active: true;
  nextKin_phone?: string;
  nextof_kin?: string;
  is_deleted: false;
  lastTime: string;
  last_assessmentTime: number;
  lname: string;
  nhs_number: string;
  patient_level: { label: string; value: string };
  photo: string;
  point_of_entry: string;
  updated_at: string;
  value?: string;
  label?: string;
}
interface IArrayfilter {
  care_home: any;
  cpass: string;
  created_by: { role: any; uid: string; name: string };
  created_byTm: string;
  cstatus: boolean;
  curr_pw: string;
  email: string;
  fname: string;
  hospital: any;
  id: string;
  is_deleted: boolean;
  lname: string;
  new_pass: string;
  password: string;
  role: { permission: any; value: string; label: string };
  updated_at: string;
  user: { uid: string; created_at: string; email: string };
}
interface IDoubleChartColors {
  backgroundColor?: string[];
  borderColor?: string[];
}
interface IAcknoledgedData {
  Assist: string;
  Encourage: string;
  Swallow: string;
  acknowledgedAt: string;
  acknowledgedBy: any;
  asmt_type: string;
  assessment_by: { uid: string; role: any; name: string };
  assessment_time: number;
  date_time: string;
  date_time_of_record: number;
  deletedBy: string;
  feedback: string;
  id: string;
  img: string;
  intake_volume: number;
  isAcknowledged: true;
  isDeleted: false;
  name_who_submitted: string;
  notes: string;
  patientId: string;
  patient_id: {
    drink_time: number;
    dob: { nanoseconds: number; seconds: number };
    lname: string;
    nhs_number: string;
    drink: string;
    eat: string;
    eat_time: number;
    email: string;
    fname: string;
    gender: string;
    holistic: string;
    holistic_time: number;
    hospital: any;
    intake: number;
    intakeValue: number;
    is_active: true
    is_deleted: false
    last_assessmentTime: number;
    nextKin_phone: string;
    nextof_kin: string;
    patient_level: {value: string; label: string;}
    phone: string;
    photo: string;
    point_of_entry: {value: string; label: string;}
    reason: string;
    updated_at: string;
    address: string;
    age: number;
    both_time: {
        last_assessment: number;
        last_updated: number;
    };
    care_home: any;
    carer_id: any;
    created_at: number;
    created_by: any;
  };
  rating: { score: number; color: string };
  remarks: string;
  type_of_drink: string;
}
interface IRole {
  label: string;
  permission: any;
  role?: any;
  value: string;
  id?: string;
}
interface IMulti {
  name: string;
  series: any[];
}
interface IColorVal {
  redVal: number;
  greenVal: number;
  orangeVal: number;
}
interface IDrinkEat {
  value: string;
  title: string;
}
interface IBeds {
  class: string;
  displayText: string;
  value: string;
}
interface ICountrydata {
  label: string;
  value: string;
}
export {
  ISettingdata,
  IRocdata,
  IChdata,
  IAreaRocDrink,
  IRocDrinkSeries,
  IBarChartOpinion,
  IBarChartData,
  IArrayfilter,
  IAreaRocEat,
  IUserData,
  IAcknoledgementDoc,
  IConcernCount,
  ICarer,
  IHospitalData,
  IBarChartColor,
  IDueData,
  IDoubleChartColors,
  IAcknoledgedData,
  IRole,
  IMulti,
  IColorVal,
  IDrinkEat,
  IBeds,
  ICountrydata,
};
