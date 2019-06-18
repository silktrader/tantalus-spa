import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPortionComponent } from './add-portion.component';

describe('AddPortionComponent', () => {
  let component: AddPortionComponent;
  let fixture: ComponentFixture<AddPortionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPortionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPortionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
