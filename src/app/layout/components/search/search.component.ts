import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Input() data: any;
  @Input() layout: string;
  searchForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public translate:TranslateService
  ) {
    this.data = [];
    this.layout = 'vertical';
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
    this.searchForm = this.formBuilder.group({
      search: ['', Validators.required],
    });
  }

  goTo(event: Event, value: string) {
    if (value) {
      let currentPage;

      currentPage = this.data.find(item => {
        return item.title === value;
      });

      if (currentPage && currentPage.routing) {
        this.router.navigate([currentPage.routing]);
      }
    }
  }
}
