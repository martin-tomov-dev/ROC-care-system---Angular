import { Component } from '@angular/core';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';
import { AuthService } from "./services/auth/auth.service";
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';
import { BnNgIdleService } from 'bn-ng-idle'; // import it to your component
import { UserIdleService } from 'angular-user-idle';
// declare var gtag;
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'app';
  currentURL = '/default-dashboard';
  userRole = '';
  cURL:any = '';
  constructor(
    public rocService: RocadminService,
    private authService: AuthService,
    private translate: TranslateService,
    public router: Router,
    public route: ActivatedRoute,
    private location: Location,
    private bnIdle: BnNgIdleService,
    private userIdle: UserIdleService
  ) {
    const navEndEvents$ = this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd)
    );
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        console.log('e.url',e.url);
        if(e.url!='/sign-in'){
          //startwatching in seconds 120 = 2 minuts
          this.bnIdle.startWatching(60000).subscribe((res) => {
            if(res) {
                // console.log("session expired");
                //localStorage.clear();
                // localStorage.removeItem('token');
                // localStorage.removeItem('currentuser')
                // localStorage.setItem("sessionExpired","Your session is expired");
                this.bnIdle.stopTimer();
                setTimeout(() => {
                  // this.router.navigate(['/sign-in'])
                  
                });
            }
          })
        }else{
          // localStorage.removeItem("sessionExpired")
        }
      }
    });
    
    
    // console.log('this.router.url', this.router.url)
    
    
    

    if (new URL(window.location.href).searchParams.get('region') == 'uk') {
      localStorage.setItem('region', 'uk')
    }
    else {
      localStorage.removeItem('region');
    }
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)).subscribe((res: any) => {
        this.currentURL = res.url;
        if (localStorage.getItem('region')) {
          
          if (res.url.includes('?region=uk')) {
            this.location.go(`${res.url}`)
          }
          else {
            this.location.go(`${res.url}?region=uk`)
          }
        }
      })
      this.rocService.getUserRole().subscribe(async r => {
        if (r[0]) {
          this.userRole = r[0]['role']['label']
          console.log('userRole',this.userRole)
          console.log('currentURL',this.currentURL)
          if((this.userRole=='carehome-manager' || this.userRole=='nurse') && this.currentURL=='/'){
            // this.router.navigate(['/patients'])
          }
        }
        // this.userRole = r[0]['role']['label']
        // console.log('userRole',this.userRole)
        // console.log('currentURL',this.currentURL)
        // if((this.userRole=='carehome-manager' || this.userRole=='nurse') && this.currentURL=='/'){
        // this.router.navigate(['/patients'])
        // }
      });
      
  }


  ngOnInit(): void {
    
    this.translate.setDefaultLang('en');
    this.authService.loggedInUser();
    this.translate.use('en');
    //Start watching for user inactivity.
    this.userIdle.startWatching();
    
    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => console.log(count));
    
    // Start watch when time is up.

    this.userIdle.onTimeout().subscribe(() => {
      console.log("session expired");
      localStorage.removeItem('token');
      localStorage.removeItem('currentuser')
      localStorage.setItem("sessionExpired","Your session is expired");
      this.router.navigate(['/sign-in']);
      this.userIdle.stopTimer();
    });
    
    // console.log('localstorage', localStorage.getItem('currentuser'))
    var func = this.rocService.getHostByWhere('carers','user.uid',localStorage.getItem('currentuser'));
    // console.log('func main', func)
    func.subscribe(
      data => {
        if (data) {
          // console.log('data main',data[0].cstatus)
          if(data[0] && data[0].cstatus==false){
              // localStorage.clear();
              localStorage.removeItem('token');
              localStorage.removeItem('currentuser')

              setTimeout(() => {
                // this.router.navigate(['/sign-in'])
              });
          }
        }
      }
    )

    this.bnIdle.startWatching(45).subscribe((res) => {
      if(res) {
          // console.log("session expired");
          // localStorage.removeItem('token');
          // localStorage.removeItem('currentuser')
          // localStorage.setItem("sessionExpired","Your session is expired");
          this.bnIdle.resetTimer();
          setTimeout(() => {
            // this.router.navigate(['/sign-in'])
          });
      }
      return;
    })
  }
  stop() {
    this.userIdle.stopTimer();
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restart() {
    this.userIdle.resetTimer();
  }
}
