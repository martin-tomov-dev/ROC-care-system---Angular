import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { RocadminService } from '../services/generalService/rocadmin.service';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  userRole: any;
  constructor(

    public authService: AuthService,
    public rocService: RocadminService,
    private router: Router
  ) {
    if (firebase.auth().currentUser)
      firebase.auth().currentUser.getIdToken().then(token => console.log('get token'))
    else console.log("No user")
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;
    return this.checkUserLogin(next, url);
  }

  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
    if (this.authService.isAuthenticated()) {
      this.rocService.getUserRole().subscribe(res => {
        this.userRole = res[0]['role']['label']
        
        if (route.data.role && route.data.role.indexOf(this.userRole) === -1) {
          this.router.navigate(['/default-dashboard']);
          return false;
        }
      }, err => {
        console.log("er", err)
      })
      return true;

    }

    this.router.navigate(['/sign-in']);
    return false;
  }
}
