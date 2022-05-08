interface IloggedInManager {
    admin_id: {name: string, uid: string, role: any};
    auth_token: string;
    facebook_authentication: string;
    fname: string;
    google_authentication: string;
    hospital: any;
    id: string;
    is_deleted: boolean;
    lname: string;
    role: {permission: any, value: string, label: string};
    updated_at: string;
    user: {created_at: string, email: string, uid: string}
  }
export { IloggedInManager }