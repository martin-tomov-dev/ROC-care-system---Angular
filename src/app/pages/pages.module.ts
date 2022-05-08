import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AgmCoreModule } from '@agm/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NzDatePickerModule, NzDividerModule, NzTableModule } from 'ng-zorro-antd';

import { environment } from '../../environments/environment';
import { UIModule } from '../ui/ui.module';
import { LayoutModule } from '../layout/layout.module';
import { BasePageComponent } from './base-page';

import { PageDashboardComponent } from './dashboards/dashboard-1';

import { PagePatientsComponent } from './medicine/patients';
import { PageCarelogsComponent } from './medicine/carelog';
import { PageActionsComponent } from './medicine/actions';
import { PagePatientProfileComponent } from './medicine/patient-profile';
import { PageUserProfileComponent } from './apps/service-pages/user-profile';
import { PageEditAccountComponent } from './apps/service-pages/edit-account';
import { PageCalendarComponent } from './apps/service-pages/calendar';
import { PageSignInComponent } from './apps/sessions/sign-in';
import { PageSignUpComponent } from './apps/sessions/sign-up';
import { PageSettingsComponent } from './settings';
import { Page404Component } from './apps/sessions/page-404';
import { Page500Component } from './apps/sessions/page-500';
import { PageDatepickersComponent } from '../ui/components/datepickers';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
//new
import{RocAdminComponent} from './medicine/roc-admin/roc-admin.component';
import{CareHomeManagerComponent} from './medicine/careHome-manager/careHome-manager.component';
import { CarersComponent } from './medicine/carers/carers.component';
import { PointOfEntryComponent } from './medicine/point-of-entry/point-of-entry.component';
import {PatientLevelComponent} from './medicine/patient-level/patient-level.component';
import { AssessmentComponent } from './medicine/assessment/assessment.component';
import {HospitalComponent} from './medicine/hospital/hospital.component';
import {AsstDataComponent} from './medicine/asstData/asstData.component';
import {LanguageLabelComponent} from './medicine/language-label/language-label.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HospitalSettingsComponent } from './medicine/hospitalSettings/hospitalSettings.component';
import {RolesPermissionComponent} from './medicine/roles-permission/roles-permission.component';
import { ChmGroupComponent } from "./medicine/chm-group/chm-group.component";
import { TooltipsComponent } from './medicine/tooltips/tooltips.component';
import { HydrationComponent } from './medicine/hydration/hydration.component';
import { PopulateitPipe } from './medicine/actions/pipe/populateit.pipe';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default
};
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // NgbModule,
    TabsModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    ChartsModule,
    NgxChartsModule,
    NgxEchartsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapApiKey
    }),
    LeafletModule,
    FullCalendarModule,
    NzDatePickerModule,
    NzDividerModule,
    NzTableModule,
    DragDropModule,

    UIModule,
    LayoutModule,
    TranslateModule
  ],
  declarations: [
    BasePageComponent,
    PageDashboardComponent,
    PagePatientsComponent,
    PageCarelogsComponent,
    PageActionsComponent,
    PagePatientProfileComponent,
    PageUserProfileComponent,
    PageEditAccountComponent,
    PageCalendarComponent,
    PageSignInComponent,
    PageSignUpComponent,
    PageSettingsComponent,
    Page404Component,
    Page500Component,
    PageDatepickersComponent,
    RocAdminComponent,
    CareHomeManagerComponent,
    CarersComponent,
    PointOfEntryComponent,
    PatientLevelComponent,
    AssessmentComponent,
    HospitalComponent,
    AsstDataComponent,
    LanguageLabelComponent,
    HospitalSettingsComponent,
    RolesPermissionComponent,
    ChmGroupComponent,
    TooltipsComponent,
    HydrationComponent,
    PopulateitPipe
  ],
  exports: [
    TranslateModule
   ],
  entryComponents: [ ]
})
export class PagesModule {}
