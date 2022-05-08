import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // user: Observable<any>;
  user = new Subject()
  originalUser:any;
  roleAs;

  constructor(
    public fireStore: AngularFirestore,   // Inject Firestore service
    public fireAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
  ) { }

  doRegister(value) {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.pass)
        .then(res => {
          resolve(res);
        }, err => reject(err))
    })
  }

  doLogin(value) {
    
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.login, value.pass)
        .then(res => {
          //storing details for remember me
          let credObj = {
            login:value.login,
            pass:btoa(value.pass),
            remember_me:true
          }
          if(value.remember_me == true) localStorage.setItem('remember_me',JSON.stringify(credObj))
          else localStorage.removeItem('remember_me')
          localStorage.setItem('currentuser',firebase.auth().currentUser.uid)
          firebase.auth().currentUser.getIdToken().then(function (idToken) {
            localStorage.setItem('token', idToken);
            // ...
          }).catch(function (error) {
          });
          resolve(res);
        }, err => reject(err))
    })
  }
  deleteUser(uid) {
    return new Promise<any>((resolve, reject) => {
      const user = firebase.auth().currentUser;
      // firebase.auth().deleteUser(uid)
      // .then(res => {
      //   resolve(res);
      // }, err => reject(err))
    }) 
  }
  forgotPassword(email) {
    return this.fireAuth.sendPasswordResetEmail(email)
  }

  changePassword(code, pwd) {
    // return this.fireAuth.confirmPasswordReset(code, pwd);
    return new Promise<any>((resolve, reject) => {
      firebase.auth().confirmPasswordReset(code,pwd)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    }) 
  }
  updatePassword(coll, value, id) {
    // return this.firestore.collection(coll).doc(id).update(value);
    var user = firebase.auth().currentUser;
    console.log('firebase user', user);
    return user.updatePassword(value.password).then((res) => {
      // return res
      console.log('res',res)
    }).catch(err => {
      return err;
    })
    // return new Promise<any>((resolve, reject) => {
    //   this.firestore.collection(coll).doc(id).update(value)
    //   .then(res => {
    //     resolve(res);
    //   }, err => reject(err))
    // }) 
  }
  
  isAuthenticated() {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  loggedInUser() {
    return this.fireAuth.user.subscribe(user => {

      this.user.next(user);
      // this.fireStore.collection('roc_admin', ref => ref.where('user.uid', '==', userId)).valueChanges().subscribe((res)=>{
      //   // console.log("RESSS::",res)
      //   this.user.next(res);
      // });

    })
  }
}
