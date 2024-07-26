import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTopUpComponent } from './wallet-top-up.component';

describe('WalletTopUpComponent', () => {
  let component: WalletTopUpComponent;
  let fixture: ComponentFixture<WalletTopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletTopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletTopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
