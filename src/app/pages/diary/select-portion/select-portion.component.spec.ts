import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPortionComponent } from './select-portion.component';

describe('SelectPortionComponent', () => {
  let component: SelectPortionComponent;
  let fixture: ComponentFixture<SelectPortionComponent>;

  beforeEach(async(() => {
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
