import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletBalanceComponent } from './wallet-balance.component';

describe('WalletBalanceComponent', () => {
  let component: WalletBalanceComponent;
  let fixture: ComponentFixture<WalletBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletBalanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
