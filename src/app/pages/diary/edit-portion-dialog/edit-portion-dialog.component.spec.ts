import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPortionDialogComponent } from './edit-portion-dialog.component';

describe('EditPortionDialogComponent', () => {
  let component: EditPortionDialogComponent;
  let fixture: ComponentFixture<EditPortionDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPortionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPortionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
