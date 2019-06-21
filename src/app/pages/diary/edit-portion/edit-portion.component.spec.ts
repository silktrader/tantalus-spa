import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPortionComponent } from './edit-portion.component';

describe('EditPortionComponent', () => {
  let component: EditPortionComponent;
  let fixture: ComponentFixture<EditPortionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPortionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPortionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
