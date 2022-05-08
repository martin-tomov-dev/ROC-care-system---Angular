import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { IPageData } from '../../interfaces/page-data';
import { IAppState } from '../../interfaces/app-state';
import { HttpService } from '../../services/http/http.service';
import { IAppSettings } from '../../interfaces/settings';
import { IMenuItem } from '../../interfaces/main-menu';
import * as SettingsActions from '../../store/actions/app-settings.actions';
import * as PatientsActions from '../../store/actions/patients.actions';
import { IPatient } from '../../interfaces/patient';
import { Subscription } from 'rxjs';

interface ISearchData {
  icon: {class: string};
  routing: string;
  title: string;
}

@Component({
  selector: 'base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss']
})
export class BaseLayoutComponent implements OnInit {
  loaded: boolean;
  pageData: IPageData;
  appSettings: IAppSettings;
  searchForm: FormGroup;
  searchData: ISearchData[];
  scrolled: boolean;
  patients: IPatient[];

  unsub$1: Subscription;
  unsub$2: Subscription;
  unsub$3: Subscription;
  unsub$4: Subscription;
  unsub$5: Subscription;

  constructor(
    public store: Store<IAppState>,
    public fb: FormBuilder,
    public httpSv: HttpService,
    public router: Router,
    public elRef: ElementRef
  ) {
    this.searchData = [];
    this.scrolled = false;
    this.patients = [];
  }

  ngOnInit() {
    this.unsub$1 = this.store.select('pageData').subscribe(data => {
      setTimeout(() => {
        this.pageData = data ? data : null;
        data.loaded ? this.loaded = true : null;
      });
    });
    this.unsub$2 = this.store.select('appSettings').subscribe(settings => {
      settings ? this.appSettings = settings : null;
    });

    this.getSearchData('assets/data/menu.json');
    // this.getData('assets/data/patients.json', 'patients', 'setPatients');
    this.initSearchForm();
    this.scrollToTop();
  }

  // get data
  // parameters:
  // * url - data url
  // * dataName - set data to 'dataName'
  // * callbackFnName run callback function with name 'callbackFnName'
  getData(url: string, dataName: string, callbackFnName?: string) {
    this.unsub$3 = this.httpSv.getData(url).subscribe(
      data => {
        this[dataName] = data;
      },
      err => {
        console.log(err);
      },
      () => {
        (callbackFnName && typeof this[callbackFnName] === 'function') ? this[callbackFnName](this[dataName]) : null;
      }
    );
  }

  getSearchData(url: string) {
    this.unsub$4 = this.httpSv.getData(url).subscribe(
      data => {
        this.getItemsRouters(data);
      },
      err => {
        console.log(err);
      }
    );
  }

  getItemsRouters(data: IMenuItem[]) {
    let links: any[] = [];

    data.forEach((item: IMenuItem) => {
      if (!item.groupTitle) {
        if (item.sub) {
          this.deploySubItems(item, links);
        } else {
          links.push(item);
        }
      }
    });
    console.log("this searchData", links);
    this.searchData = links;
  }

  deploySubItems(item: any, links) {
    item.sub.forEach((subItem) => {
      if (subItem.sub) {
        this.deploySubItems(subItem, links)
      } else {
        subItem.title = `${item.title} > ${subItem.title}`;
        links.push(subItem);
      }
    });
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      search: ''
    });
  }

  toggleSidebar(value: boolean) {
    this.store.dispatch(new SettingsActions.SidebarState(value));
  }

  onScroll(event: any) {
    this.scrolled = event.target.scrollTop > 0;
  }

  // scroll to page top
  scrollToTop() {
    this.unsub$5 = this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      const CONTAINER = this.elRef.nativeElement.querySelector('.main-content') || window;

      setTimeout(() => {
        CONTAINER.scrollTo(0, 0);
      });
    });
  }

  ngOnDestroy() {
    if (this.unsub$1) this.unsub$1.unsubscribe();
    if (this.unsub$2) this.unsub$2.unsubscribe();
    if (this.unsub$3) this.unsub$3.unsubscribe();
    if (this.unsub$4) this.unsub$4.unsubscribe();
    if (this.unsub$5) this.unsub$5.unsubscribe();
  }

  // set patients to store
  setPatients() {
    this.store.dispatch(new PatientsActions.Set(this.patients));
  }
}
