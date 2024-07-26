import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankLinkDialogComponent } from './bank-link-dialog.component';

describe('BankLinkDialogComponent', () => {
  let component: BankLinkDialogComponent;
  let fixture: ComponentFixture<BankLinkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankLinkDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BankLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
