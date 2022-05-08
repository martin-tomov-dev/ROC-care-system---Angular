import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerticalLayoutComponent } from '../layout/vertical';
import { PublicLayoutComponent } from '../layout/public';

import { PageDashboardComponent } from '../pages/dashboards/dashboard-1';

import { PagePatientsComponent } from '../pages/medicine/patients';
import { PagePatientProfileComponent } from '../pages/medicine/patient-profile';

import { PageUserProfileComponent } from '../pages/apps/service-pages/user-profile';
import { PageEditAccountComponent } from '../pages/apps/service-pages/edit-account';
import { PageCalendarComponent } from '../pages/apps/service-pages/calendar';
import { PageSignInComponent } from '../pages/apps/sessions/sign-in';
import { PageSignUpComponent } from '../pages/apps/sessions/sign-up';
import { PageSettingsComponent } from '../pages/settings';
import { Page404Component } from '../pages/apps/sessions/page-404';
import { Page500Component } from '../pages/apps/sessions/page-500';

//new component
import { RocAdminComponent } from '../pages/medicine/roc-admin/roc-admin.component';

import { AuthGuard } from '../guards/auth.guard';
import { NonAuth } from '../guards/non-auth.guard';
import { CareHomeManagerComponent } from '../pages/medicine/careHome-manager/careHome-manager.component';
import { ForgotPasswordComponent } from '../layout/components/forgot-password/forgot-password.component';
import { PasswordResetComponent } from '../layout/components/password-reset/password-reset.component';
import { CarersComponent } from '../pages/medicine/carers/carers.component';
import { PointOfEntryComponent } from '../pages/medicine/point-of-entry/point-of-entry.component';
import { PatientLevelComponent } from '../pages/medicine/patient-level/patient-level.component';
import { AssessmentComponent } from '../pages/medicine/assessment/assessment.component';
import { HospitalComponent } from '../pages/medicine/hospital/hospital.component';
import { AsstDataComponent } from '../pages/medicine/asstData/asstData.component';
import { LanguageLabelComponent } from '../pages/medicine/language-label/language-label.component';
import { HospitalSettingsComponent } from '../pages/medicine/hospitalSettings/hospitalSettings.component';
import {RolesPermissionComponent} from '../pages/medicine/roles-permission/roles-permission.component';
import {ChmGroupComponent} from '../pages/medicine/chm-group/chm-group.component';
import {TooltipsComponent} from '../pages/medicine/tooltips/tooltips.component';
import { HydrationComponent } from '../pages/medicine/hydration/hydration.component';
import { PageCarelogsComponent } from '../pages/medicine/carelog';
import { PageActionsComponent } from '../pages/medicine/actions';


export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/default-dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: VerticalLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'default-dashboard', component: PageDashboardComponent },
      { path: 'patients', component: PagePatientsComponent },
      { path: 'patient-profile/:id', component: PagePatientProfileComponent },

      { path: 'user-profile/:id', component: PageUserProfileComponent },
      { path: 'edit-account', component: PageEditAccountComponent },
      { path: 'events-calendar', component: PageCalendarComponent },
      { path: 'settings', component: PageSettingsComponent },
      { path: 'carelogs/:id', component: PageCarelogsComponent },
      { 
        path: 'actions', 
        component: PageActionsComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin', 'carehome-manager', 'nurse']
        }
      },
      
      { 
        path: 'roc_admin',
        component: RocAdminComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        } 
      },
      { 
        path: 'carehome_manager',
        component: CareHomeManagerComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin','chm-group']
        } 
      },
      { 
        path: 'carers', 
        component: CarersComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin','carehome-manager','chm-group']
        }
      },
      { 
        path: 'hospitals', 
        component: HospitalComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin','chm-group']
        }
      },
      { 
        path: 'point_of_entry', 
        component: PointOfEntryComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        } 
      },
      { 
        path: 'patient_level', 
        component: PatientLevelComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        } 
      },
      { 
        path: 'assessment',
        component: AssessmentComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['nurse', 'carehome-manager']
        }
      },
      { 
        path: 'hydration/:id',
        component: HydrationComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['nurse', 'carehome-manager', 'chm-group']
        }
      },
      { 
        path: 'assessment-data', 
        component: AsstDataComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['carehome-manager','nurse','chm-group']
        }
      },
      { 
        path: 'language-label', 
        component: LanguageLabelComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        }
      },
      { 
        path: 'hospital-settings', 
        component: HospitalSettingsComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        }
      },
      { 
        path: 'roles-permission', 
        component: RolesPermissionComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        }
      },
      { 
        path: 'chm-group', 
        component: ChmGroupComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        }
      },
      { 
        path: 'tooltips', 
        component: TooltipsComponent,
        canActivate: [AuthGuard],
        data: {
          role: ['roc-admin','super-admin']
        }
      }

    ]
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'sign-in', component: PageSignInComponent, canActivate: [NonAuth] },
      { path: 'sign-up', component: PageSignUpComponent, canActivate: [NonAuth] },
      { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [NonAuth] },
      { path: 'reset-password', component: PasswordResetComponent, canActivate: [NonAuth] },
      { path: 'page-404', component: Page404Component },
      { path: 'page-500', component: Page500Component },
      { path: '**', component: Page404Component },
    ]
  }
];

@NgModule({
  imports: [

  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RoutingModule { }
