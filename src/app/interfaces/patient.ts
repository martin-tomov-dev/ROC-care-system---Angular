interface IPatient {
  id: string;
  assessment: any;
  both_time: any;
  care_home: any;
  carer_id: string;
  created_at: number;
  created_by: string;
  dob: any;
  drink: string;
  drink_time: number;
  fname: string;
  fullName: string;
  hospital: any;
  hospitalname: string;
  idd: number;
  intake: number;
  is_active: boolean;
  is_deleted: boolean;
  last_assessmentTime: number;
  lname: string;
  nhs_number: string;
  patient_level: any;
  photo: string;
  point_of_entry: string;
  updated_at: number;  
  img?: string | ArrayBuffer;
  name?: string;
  number?: string;
  age: number;
  gender: string;
  address: string;
  eat_time?: number;
  holistic_time?: number;  
  status?: string;
  lastVisit?: string;
  priority_time?: string;
}

interface ICarehomeData {
  admin_id: {uid: string, role: {value: string, label: string}, name: string};
  auth_token: string;
  facebook_authentication: string;
  fname: string;
  google_authentication: string;
  hospital: any;
  id: string;
  value: string;
  label: string;
  is_deleted: boolean;
  lname: string;
  role: {label: string, value: string, permission: any};
  updated_at: string;
  user: {created_at: string, email: string, uid: string}
}

interface ICareData {
  care_home: any;
  cpass: string;
  created_by: {role: {label: string, permission: any, value: string}, uid: string, name: string};
  cstatus: true;
  curr_pw: string;
  fname: string;
  hospital: any;
  id: string;
  is_deleted: false;
  label: string;
  lname: string;
  new_pass: string;
  password: string;
  role: {permission: any, label: string, value: string}
  updated_at: string;
  user: {created_at: string, email: string, uid: string}
  value: string;
}

interface IEntryPoint {
  created_at: string;
  entry_from: string;
  id: string;
  label: string;
  updated_at: string;
  value: string;
}

interface IAssesment {
  ass_time: string;
  created_at: number;
  id: string;
  is_default: boolean;
  label: string;
  no_assessment: string;
  title: string;
  updated_at: string;
  value: string;
}

interface ICurrentUser {
  name: string;
  role: {value: string, label: string, permission: any};
  uid: string;
}

export { IPatient, ICarehomeData, ICareData, IEntryPoint, IAssesment, ICurrentUser }