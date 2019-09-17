import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongPortionsListComponent } from './long-portions-list.component';

describe('LongPortionsListComponent', () => {
  let component: LongPortionsListComponent;
  let fixture: ComponentFixture<LongPortionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongPortionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongPortionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
