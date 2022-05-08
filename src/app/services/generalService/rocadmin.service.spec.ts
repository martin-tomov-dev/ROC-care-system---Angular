/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RocadminService } from './rocadmin.service';

describe('Service: Rocadmin', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RocadminService]
    });
  });

  it('should ...', inject([RocadminService], (service: RocadminService) => {
    expect(service).toBeTruthy();
  }));
});
