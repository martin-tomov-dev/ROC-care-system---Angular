import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError as observableThrowError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  private api_url = environment.server_url;

  constructor(private http: HttpClient, public firestore: AngularFirestore) { }


  getData(source: string) {
    return this.http.get(source).pipe(
      tap((res: any) => {
        // console.log("Source URL :: ", source);
        
        // console.log("serviceRES :: ",res);
        
        res
      }),
      catchError(this.handleError)
    );
  }

  deleteAuthUser(uid) {
    return this.http.delete(`${this.api_url}/deleteUser/${uid}`);
  }

  sendMail(data){
    // console.log("HTTP calling email",data,this.api_url)
    return this.http.post(`${this.api_url}/sendmail/`,data);
  }

  // getDataROC(coll) {
  //   return this.firestore.collectionGroup(coll).valueChanges().pipe(
  //     tap((res: any) => res),
  //     catchError(this.handleError)
  //   );
  // }

  private handleError(error: any) {
    return observableThrowError(error.error || 'Server error');
  }
}
