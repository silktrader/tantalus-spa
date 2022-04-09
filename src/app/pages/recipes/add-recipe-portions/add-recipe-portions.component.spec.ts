import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddRecipePortionsComponent } from './add-recipe-portions.component';

describe('AddRecipePortionsComponent', () => {
  let component: AddRecipePortionsComponent;
  let fixture: ComponentFixture<AddRecipePortionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRecipePortionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecipePortionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
