import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrAuthStatusComponent } from './qr-auth-status.component';

describe('QrAuthStatusComponent', () => {
  let component: QrAuthStatusComponent;
  let fixture: ComponentFixture<QrAuthStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrAuthStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QrAuthStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
