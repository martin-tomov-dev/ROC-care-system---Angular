import { Injectable } from '@angular/core';
import { AngularFirestore, validateEventsArray } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { map, mergeMap, switchMap, tap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { async } from '@angular/core/testing';


@Injectable({
  providedIn: 'root'
})
export class RocadminService {
  priorityAsmt = new Subject();
  dueAssessment = new Subject();
  dueAssessmentCount: any;

  constructor(
    private firestore: AngularFirestore,
    public fireAuth: AngularFireAuth,
    public authService: AuthService
  ) {

  }

  setPriorityState(statusData) {
    this.priorityAsmt.next(statusData);
  }

  getPriorityState() {
    return this.priorityAsmt.asObservable();
  }

  updateUser(coll, value, id) {
    return this.firestore.collection(coll).doc(id).update(value);
  }
  
  getCronData(coll, field) {
    let cronRef = this.firestore.collection(coll, ref => ref.orderBy(field, 'desc').limit(7));
    // console.log('conRef',cronRef);
    
    return cronRef.snapshotChanges().pipe(
      map((doc: any) => {
        // console.log('doc',doc);
        
        let dataArr = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;
          dataArr.push(other)
        });
        // console.log('dataArr',dataArr);
        
        return dataArr;
      }))
  }

  getUser(coll) {
    return this.firestore.collection(coll).snapshotChanges().pipe(
      map((doc: any) => {
        let dataArr = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;
          dataArr.push(other)
        });
        return dataArr;
      }))
  }
  getUserWithRef(coll, refKey: any[]) {
    return this.firestore.collection(coll).snapshotChanges().pipe(
      map(res => {
        let mainListItems = [];
        res.forEach(doc => {
          let newItem = doc.payload.doc.data();
          newItem['id'] = doc.payload.doc.id;
          mainListItems.push(newItem);
        })
        return mainListItems;
      })

    );
  }

  //for pagination
  getUserWithRefPag(coll, field, value, ref, refKeyAr?, lastData?) {
    const refKey = firebase.firestore()
      .collection(ref)
      .doc(value);
    // orderBy('created_at','desc')
    return this.firestore.collection(coll, ref => ref.where(field, '==', refKey)
      .orderBy('created_at', 'desc')
      .startAfter(lastData)
      .limit(5)).snapshotChanges().pipe(
        map((doc: any) => {
          let dataArr = [];
          doc.forEach(function (d) {
            let other = d.payload.doc.data();
            other['id'] = d.payload.doc.id;
            if (refKeyAr) {
              refKeyAr.forEach(element => {
                if (other[element]) {
                  other[element].get().then(res => {
                    other[element] = res.data()
                    other[element]['id'] = res['id'];
                  }).catch(err => console.error(err));
                }
              });
            }
            dataArr.push(other)
          });

          return dataArr;
        }))
  }

  getUserWithRefByID(coll, id, refKey: any[]) {
    return this.firestore.collection(coll).doc(id).valueChanges().pipe(
      map((resp) => {
        if (resp) {
          refKey.forEach(element => {
            if (element) {
              if (resp[element] != "") {
                // console.log('ELE ', element)
                // console.log('resp', resp[element])
                resp[element].get().then(res => {
                  if (res.data()) {
                    resp[element] = res.data();
                    // console.log('resp[element]', resp[element]);
                    
                    resp[element]['id'] = res['id'];
                  }
                }).catch(err => console.error(err));
              }
            }
          });
        }
        return resp;
      })
    )
  }



  deleteUser(coll, id) {
    return this.firestore.collection(coll).doc(id).delete();
  }

  getUserRole() {
    return this.firestore.collection('user_role', ref => ref.where('uid', '==', localStorage.getItem('currentuser'))).valueChanges()
  }

  getUserById(coll, id) {
    return this.firestore.collection(coll).doc(id).valueChanges()
  }

  getPatientByIdRole(coll, field, refKeyAr?) {
    
    return this.firestore.collection(coll, ref => ref.where(field, '==', localStorage.getItem('currentuser'))).snapshotChanges().pipe(
      map((doc: any) => {
        let dataArr = [];
        doc.forEach((d) => {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;
          console.log("refKeyAr", other['hospital'])
          // if (refKeyAr) {
          //   refKeyAr.forEach(element => {
          //     if (other[element]) {
          //       other[element].get().then(res => {
          //         other[element] = res.data()
          //         other[element]['id'] = res['id'];
          //       }).catch(err => console.log(err));
          //     }
          //   });
          // }

          dataArr.push(other)
        });
        return dataArr;
      }))
  }
  //
  getHospitalByIdPatients(coll, field, refKeyAr?) {
    return this.firestore.collection(coll, ref => ref.where(field, '==', localStorage.getItem('currentuser'))).snapshotChanges().pipe(
      map((doc: any) => {
        let patientHos = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();;
          other['id'] = d.payload.doc.id;
          if (refKeyAr) {
            refKeyAr.forEach(element => {
              if (other[element]) {
                other[element].get().then(res => {
                  other[element] = res.data()
                  other[element]['id'] = res['id'];
                }).catch(err => console.error(err));
              }
            });
          }

          patientHos.push(other)
        });
        return patientHos;
      }))
  }
  // 
  getHostByWhere(coll, field, value) {
    return this.firestore.collection(coll, ref => ref.where(field, '==', value)).snapshotChanges().pipe(
      map((doc: any) => {
        let Arr = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;

          Arr.push(other)
        });

        return Arr;
      }))
  }
  getUserByWhere(coll, field, value) {
    return this.firestore.collection(coll, ref => ref.where(field, '==', value)).snapshotChanges().pipe(
      map((doc: any) => {
        let dataArr = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;

          dataArr.push(other)
        });

        return dataArr;
      }))
  }

  getUserByWhereHL(coll, field, value) {
    if(coll=="roc-admin"){
      return this.firestore.collection(coll, ref => ref.limit(1).where(field, '==', value)).snapshotChanges().pipe(
        map((doc: any) => {
          let dataArr = [];
          doc.forEach(function (d) {
            let other = d.payload.doc.data();
            other['id'] = d.payload.doc.id;
  
            dataArr.push(other)
          });
  
          return dataArr;
        }))
    } else {
      return this.firestore.collection(coll, ref => ref.limit(1).where(field, '==', value)).snapshotChanges().pipe(
        map((doc: any) => {
          let dataArr = [];
          doc.forEach(function (d) {
            let other = d.payload.doc.data();
            other['id'] = d.payload.doc.id;
  
            dataArr.push(other)
          });
  
          return dataArr;
        }))
    }
    
  }

  getUserByWhereIn(coll, field, value) {
    return this.firestore.collection(coll, ref => ref.where(field, 'in', value)).snapshotChanges().pipe(
      map((doc: any) => {
        let dataArr = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;

          dataArr.push(other)
        });

        return dataArr;
      }))
  }

  getUserByWhereRef(coll, field, value, ref, refKeyAr?) {
    const refKey = firebase.firestore()
      .collection(ref)
      .doc(value)
    return this.firestore.collection(coll, ref => ref.where(field, '==', refKey)
    ).snapshotChanges().pipe(
      map((doc: any) => {
        let dataArr = [];
        doc.forEach(function (d) {
          let other = d.payload.doc.data();
          if (other) {
            other['id'] = d.payload.doc.id;
          }
          dataArr.push(other)
        });
        return dataArr;
      }))
  }
  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  validationForSpace(controlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      if (control.errors && !control.errors.spaceValidator) {
        return;
      }
      if (control.value.startsWith(' ')) {
        control.setErrors({ spaceValidator: true });
      }
      if (control.value.endsWith(' ')) {
        control.setErrors({ spaceValidator: true });

      }
    }
  }

  //add new record 

  addRecord(coll, value) {
    return this.firestore.collection(coll).add(value)
  }

  updateRef(hid, value, ary, fieldId, fieldToUpdate) {
    ary.forEach(element => {
      this.getUserByWhere(element, fieldId, hid).subscribe(r => {
        if (r) {
          let update = {
            [fieldToUpdate]: value
          }
          r.forEach(el => {
            this.updateUser(element, update, el.id);
          })
        }
      })
    });
  }
// D

getUserWithRefHostpital(coll, refKey: any[]) {
  // console.log('refKey ', refKey)
  return this.firestore.collection(coll).snapshotChanges().pipe(
    map((res: any) => {
      let mainListItems = [];
      res.forEach(doc => {
        if (doc) {
          let newItem = doc.payload.doc.data();
          // console.log('newItem ', newItem)
          newItem['id'] = doc.payload.doc.id;
          refKey.forEach(element => {
            // console.log('ELE :: ', element, ' ', newItem[element])
            let refs = newItem[element];
            // console.log('CON ', element, ' ', (refs && (refs.length > 0 || refs != "")))
            if (element && refs && (refs.length > 0 || refs != "")) {
              // console.log('Andar bhi hai bhai')
              if (Array.isArray(refs)) refs = refs[0];
              refs.get().then(res => {
                // console.log('RES ', res)
                if (res && res.data()) {
                  refs = res.data()
                  newItem[element] = refs;
                  refs['id'] = res['id'];
                }
              }).catch(err => console.error(err));
            } else {
              // console.log('Nai hai bhai')
            }
          });
          mainListItems.push(newItem);
        }
      });
      // console.log('mainListItems ', mainListItems)
      return mainListItems
    })
  )
}
getCareLogsData() {
  return this.firestore.collection('roc_drink').valueChanges()
  // return this.firestore.collection('user_role', ref => ref.where("author", "==", user)).valueChanges()
}
getRecordIntake(){
  return this.firestore.collection('log-store-intake').valueChanges()
}
getFeedbackData() {
  return this.firestore.collection('roc_point_of_care_hydration').valueChanges()
}
getUserByWhereWithId(coll) {
  return this.firestore.collection(coll).snapshotChanges().pipe(
    map((doc: any) => {
      let dataArr = [];
      doc.forEach(function (d) {
        let other = d.payload.doc.data();
        other['id'] = d.payload.doc.id;
        dataArr.push(other)
      });
      return dataArr;
    }))
}

getByPath(path:string){
  return this.firestore.doc(path).snapshotChanges()
  .pipe(map((doc: any) => {
    if(doc) {
      let data=doc.payload.data();
      if(data) {
        let passer={id:'',fullName:''};
        passer['id'] = doc.payload.id;
        passer['actualData']=data;
        if(data.name){
          passer['fullName']=data.name;
        }else{
          passer['fullName']=data.fname+" "+data.lname;
        }
        return passer;
      }
      
    }
      
    }));
}

getByPathPromise(path:string){
  return this.firestore.doc(path).snapshotChanges()
    .pipe(take(1)).toPromise()
}

convertPath(doc) {
    let data=doc.payload.data();
    if(data) {
      let passer={id:'',fullName:''};
      passer['id'] = doc.payload.id;
      passer['actualData']=data;
      if(data.name){
        passer['fullName']=data.name;
      }else{
        passer['fullName']=data.fname+" "+data.lname;
      }
      return passer;
    }
}


getPopByPath(path:string,refField:string){
  return this.firestore.doc(path).snapshotChanges()
  .pipe(map((doc: any) => {
      let data=doc.payload.data();
      let passer={id:''};
      passer['id'] = doc.payload.id;
      if(refField){
        this.getByPath(data[refField].path).subscribe((refData:any)=>{
          data[refField]=refData;
        })
      }
      return {...passer,...data};
    }));
}

getAllwithPop(collection:string,refField:string){
    return this.firestore.collection(collection, ref => ref.where('feedback','==','C')).snapshotChanges().pipe(
      map((doc: any) => {
        let dataArr = [];
        let self=this;
        doc.forEach(async function(d) {
          let other = d.payload.doc.data();
          other['id'] = d.payload.doc.id;
          if(refField){
            self.getByPath(other[refField].path).subscribe((refData:any)=>{
              if(refData)
                other[refField]=refData.actualData;
            });
          }
          dataArr.push(other)
        });
        return dataArr;
      }));
}

getAllwithPopWithoutField(collection:string){
  return this.firestore.collection(collection, ref => ref.where('feedback','==','C')).snapshotChanges().pipe(
    map((doc: any) => {
      let dataArr = [];
      doc.forEach((d) => {
        let other = d.payload.doc.data();
        other['id'] = d.payload.doc.id;
        dataArr.push(other)
      });
      return dataArr;
    }));
}

createNewUser(coll, value) {
  return firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
    .then(registeredUser => {
      registeredUser.user.updateProfile({
        displayName: `${value.fname}`
      }).then(userUpdate => {
        this.firestore.collection('user_role')
          .add({
            uid: registeredUser.user['uid'],
            name: registeredUser.user['displayName'],
            role: value['role'],

          }).then(res => {
            let userObj = {
              uid: registeredUser.user['uid'],
              email: registeredUser.user['email'],
              created_at: registeredUser.user['metadata'].creationTime
            }
            value['user'] = userObj;
            delete value.email;
            delete value.password;
            delete value.cpassword

            this.firestore.collection(coll)
              .add(value)
          }).catch(err => console.log('Err :: ', err))
      })
    })
}
checkPassword(coll, val,field, id) {
  console.log('coll',coll);
  console.log('val',val);
  console.log('id',id);
  let user = firebase.auth().currentUser;
  console.log('firebase user',user);
  
  return this.firestore.collection(coll, ref => ref.where(field, '==', id).where('user.password', '==', val)).snapshotChanges().pipe(
    map((doc: any) => {
      let dataArr = [];
      doc.forEach(function (d) {
        let other = d.payload.doc.data();
        other['id'] = d.payload.doc.id;

        dataArr.push(other)
      });

      return dataArr;
    }))
}
// test(collection:string,refField:string){
//   this.firestore.collection(collection).snapshotChanges().pipe(
//     switchMap((restaurants: any[]) => { 
//       const res = restaurants.map((r: any) => { 
//         return this.firestore
//           .collection(r[refField]).snapshotChanges()
//           .pipe(
//             map(ratings => Object.assign(r, {ratings}))
//           ); 
//         }); 
//       return combineLatest(...res); 
//     }))
// }

}
