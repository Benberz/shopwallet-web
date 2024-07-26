import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelcosTabComponent } from './telcos-tab.component';

describe('TelcosTabComponent', () => {
  let component: TelcosTabComponent;
  let fixture: ComponentFixture<TelcosTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelcosTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TelcosTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
