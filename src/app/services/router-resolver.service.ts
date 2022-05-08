import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from './auth/auth.service';

@Injectable()
export class NewsResolver implements Resolve<any> {
  constructor(
    public authService:AuthService
  ) {}

  // public news: any = undefined;

  resolve() {
    return 'test';
    // return this.authService..pipe(
    //   map(dataFromApi => {
    //     console.log("DT:", dataFromApi);
    //     return dataFromApi;
    //   }),
    //   catchError(err => Observable.throw(err.json().error))
    // );
  }
}
@Injectable({
  providedIn: 'root'
})
export class RouterResolverService {

constructor() { }

}
