/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RouterResolverService } from './router-resolver.service';

describe('Service: RouterResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouterResolverService]
    });
  });

  it('should ...', inject([RouterResolverService], (service: RouterResolverService) => {
    expect(service).toBeTruthy();
  }));
});
