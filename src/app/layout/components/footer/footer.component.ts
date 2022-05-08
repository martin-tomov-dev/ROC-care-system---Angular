import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';

import { IPageData } from '../../../interfaces/page-data';
import { Content } from '../../../ui/interfaces/modal';
import { TCModalService } from '../../../ui/services/modal/modal.service';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @HostBinding('class.footer') true;
  @HostBinding('class.loaded') @Input() loaded: boolean;
  @HostBinding('class.boxed') @Input() boxed: boolean;

  @Input() pageData: IPageData;

  version: string;
  loggedInUsrRole:string;

  constructor(
    private modal: TCModalService,
    public rocService:RocadminService
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.rocService.getUserRole().subscribe((res: any) => {
      if (res) {      
        this.loggedInUsrRole = res[0]['role']['label'];
        switch(this.loggedInUsrRole) {
          case 'nurse':
            this.loggedInUsrRole='Carer';
            break;

          case 'carehome-manager':
            this.loggedInUsrRole='Manager';
            break;

          case 'chm-group':
            this.loggedInUsrRole='Manger Group';
            break;

          case 'roc-admin':
            this.loggedInUsrRole='Admin';
            break;

          case 'super-admin':
            this.loggedInUsrRole='Super Admin';
            break;

          default:
            break;
        }
      }
    });
   }

  // open modal window
  openModal<T>(body: Content<T>, header: Content<T> = null, footer: Content<T> = null, options: any = null) {
    this.modal.open({
      body: body,
      header: header,
      footer: footer,
      options: options
    });
  }
}
