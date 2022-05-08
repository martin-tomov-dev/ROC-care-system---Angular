import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'page-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class PageSignInComponent implements OnInit {
  sessionExpired = '';
  constructor(
    ) { 
      
    }

  ngOnInit() { 
    this.sessionExpired = localStorage.getItem("sessionExpired")
    localStorage.removeItem("sessionExpired");
  }
}
