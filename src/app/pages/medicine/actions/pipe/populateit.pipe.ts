import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { RocadminService } from 'src/app/services/generalService/rocadmin.service';

@Pipe({
  name: 'populateit'
})
export class PopulateitPipe implements PipeTransform {

  constructor(private service:RocadminService) {  }

  transform(value: any): Observable<any> {
    return this.service.getByPath(value);
  }

}
