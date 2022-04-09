import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPortionFullscreenComponent } from './edit-portion-fullscreen.component';

describe('EditPortionFullscreenComponent', () => {
  let component: EditPortionFullscreenComponent;
  let fixture: ComponentFixture<EditPortionFullscreenComponent>;

  beforeEach(waitForAsync(() => {
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
