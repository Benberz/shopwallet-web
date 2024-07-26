import { TestBed } from '@angular/core/testing';

import { HolderBankAccountService } from './holder-bank-account.service';

describe('HolderBankAccountService', () => {
  let service: HolderBankAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolderBankAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
