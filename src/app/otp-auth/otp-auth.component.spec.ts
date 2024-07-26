import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpAuthComponent } from './otp-auth.component';

describe('OtpAuthComponent', () => {
  let component: OtpAuthComponent;
  let fixture: ComponentFixture<OtpAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtpAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
