import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddPortionDialogComponent } from './add-portion-dialog.component';

describe('AddPortionDialogComponent', () => {
  let component: AddPortionDialogComponent;
  let fixture: ComponentFixture<AddPortionDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPortionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPortionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
