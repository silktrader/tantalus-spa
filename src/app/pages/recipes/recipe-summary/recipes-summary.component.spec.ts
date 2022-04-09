import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecipesSummaryComponent } from './recipes-summary.component';

describe('RecipeSummaryComponent', () => {
  let component: RecipesSummaryComponent;
  let fixture: ComponentFixture<RecipesSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RecipesSummaryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipesSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
