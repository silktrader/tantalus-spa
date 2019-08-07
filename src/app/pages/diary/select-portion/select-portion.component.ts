import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodsService } from 'src/app/services/foods.service';
import { Meal } from 'src/app/models/meal.model';
import { Diary } from 'src/app/models/diary.model';
import { Recipe } from 'src/app/models/recipe.model';
import { IPortion } from 'src/app/models/portion.interface';

@Component({
  selector: 'app-select-portion',
  templateUrl: './select-portion.component.html',
  styleUrls: ['./select-portion.component.css']
})
export class SelectPortionComponent implements OnInit, OnDestroy, AfterViewInit {
  public filteredFoods$: Observable<ReadonlyArray<IPortion>>;
  nameFilter: BehaviorSubject<string> = new BehaviorSubject('');

  public mealSelector: FormControl = new FormControl();
  public searchBox: FormControl = new FormControl();
  public filterForm: FormGroup = new FormGroup({
    mealSelector: this.mealSelector,
    searchBox: this.searchBox
  });

  public diary: Diary;

  private subscription = new Subscription();

  @ViewChild('searchBoxInput', { static: true }) searchBoxInputRef: ElementRef;

  constructor(
    private fs: FoodsService,
    public ds: DiaryService,
    private ui: UiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.filteredFoods$ = this.fs.getFilteredFoods(this.nameFilter);

    // attempt to read the selected meal from the state, else fall back on the last used meal
    const meal =
      history.state && Number.isInteger(history.state.meal)
        ? history.state.meal
        : this.ds.focusedMeal;
    this.mealSelector.setValue(meal);

    this.subscription.add(this.ds.diary$.subscribe(diary => (this.diary = diary)));

    this.subscription.add(
      this.mealSelector.valueChanges.subscribe(value => (this.ds.focusedMeal = value))
    );
    this.searchBoxInputRef.nativeElement.focus();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public get availableMeals(): ReadonlyArray<number> {
    return Meal.numbers;
  }

  public back(): void {
    this.ui.goBack();
  }

  public search($event): void {
    this.nameFilter.next($event.target.value);
  }

  public resetSearch(): void {
    this.searchBox.setValue('');
    this.nameFilter.next('');
  }

  /**
   * Triggers the creation of a new food through the relevant route
   */
  public startFoodCreation(): void {
    this.router.navigate(['/add-food'], {
      queryParams: { name: this.searchBox.value }
    });
  }

  /**
   * Leads to the dialog which allows editing quantities and which meal the portion(s) belong to
   * @param selection Either a `Food` or a `Recipe`
   */
  public proceedWithSelection(selection: IPortion): void {
    if (this.isRecipe(selection)) {
      this.router.navigate(['../add-recipe', selection.id], {
        relativeTo: this.route,
        state: { recipe: selection, meal: this.mealSelector.value }
      });
    } else {
      this.router.navigate([selection.id], {
        relativeTo: this.route,
        state: { meal: this.mealSelector.value }
      });
    }
  }

  public mealName(mealNumber: number) {
    return Meal.mealNames[mealNumber];
  }

  public isRecipe(portion: IPortion): portion is Recipe {
    return (portion as Recipe).ingredients !== undefined;
  }
}
