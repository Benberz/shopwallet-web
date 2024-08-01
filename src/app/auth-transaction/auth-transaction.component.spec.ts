import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthTransactionComponent } from './auth-transaction.component';

describe('AuthTransactionComponent', () => {
  let component: AuthTransactionComponent;
  let fixture: ComponentFixture<AuthTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
