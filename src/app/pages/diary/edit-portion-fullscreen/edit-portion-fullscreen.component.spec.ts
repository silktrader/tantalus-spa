import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPortionFullscreenComponent } from './edit-portion-fullscreen.component';

describe('EditPortionFullscreenComponent', () => {
  let component: EditPortionFullscreenComponent;
  let fixture: ComponentFixture<EditPortionFullscreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPortionFullscreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPortionFullscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
