import { TestBed } from '@angular/core/testing';

import { BsaService } from './bsa.service';

describe('BsaService', () => {
  let service: BsaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BsaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
