import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileReloadDialogComponent } from './mobile-reload-dialog.component';

describe('MobileReloadDialogComponent', () => {
  let component: MobileReloadDialogComponent;
  let fixture: ComponentFixture<MobileReloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileReloadDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileReloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
