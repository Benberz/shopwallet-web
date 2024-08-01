import { TestBed } from '@angular/core/testing';

import { MobileReloadService } from './mobile-reload.service';

describe('MobileReloadService', () => {
  let service: MobileReloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileReloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
