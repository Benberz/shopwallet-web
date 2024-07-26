import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotpDialogComponent } from './totp-dialog.component';

describe('TotpDialogComponent', () => {
  let component: TotpDialogComponent;
  let fixture: ComponentFixture<TotpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotpDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
