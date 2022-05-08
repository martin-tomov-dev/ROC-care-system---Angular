import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { StoreModule } from '@ngrx/store';
import { UserIdleModule } from 'angular-user-idle';
import { en_US, NgZorroAntdModule, NZ_I18N } from 'ng-zorro-antd';

import { AppComponent } from './app.component';
import { ROUTES, RoutingModule } from './routing/routing.module';
import { LayoutModule } from './layout/layout.module';
import { UIModule } from './ui/ui.module';
import { PagesModule } from './pages/pages.module';
import { pageDataReducer } from './store/reducers/page-data.reducer';
import { appSettingsReducer } from './store/reducers/app-settings.reducer';
import { patientsReducer } from './store/reducers/patients.reducer';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FirebaseTransLoader } from "./FirebaseTransLoader";
import { AngularFirestore } from '@angular/fire/firestore';
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { BnNgIdleService } from 'bn-ng-idle'; // import bn-ng-idle service


export function FbTransLoaderFactory(db: AngularFirestore) {
  return new FirebaseTransLoader(db);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES),
    StoreModule.forRoot({
      pageData: pageDataReducer,
      appSettings: appSettingsReducer,
      patients: patientsReducer
    }),
    NgZorroAntdModule,

    RoutingModule,
    LayoutModule,
    UIModule,
    PagesModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    SweetAlert2Module.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right'
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: FbTransLoaderFactory,
        deps: [AngularFirestore]
      }
    }),
    UserIdleModule.forRoot({idle: 89, timeout: 1, ping: 12})
  ],
  providers: [
    // { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: NZ_I18N, useValue: en_US },
    BnNgIdleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
