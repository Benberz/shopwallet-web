import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardTabComponent } from './credit-card-tab.component';

describe('CreditCardTabComponent', () => {
  let component: CreditCardTabComponent;
  let fixture: ComponentFixture<CreditCardTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditCardTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
