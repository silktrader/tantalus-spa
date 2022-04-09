import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectPortionComponent } from './select-portion.component';

describe('SelectPortionComponent', () => {
  let component: SelectPortionComponent;
  let fixture: ComponentFixture<SelectPortionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPortionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPortionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
