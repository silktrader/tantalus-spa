import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiarySummaryComponent } from './diary-summary.component';

describe('DiarySummaryComponent', () => {
  let component: DiarySummaryComponent;
  let fixture: ComponentFixture<DiarySummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DiarySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiarySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
