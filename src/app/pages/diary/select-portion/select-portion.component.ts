import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodsService } from 'src/app/services/foods.service';
import { Diary } from 'src/app/models/diary.model';
import { Recipe } from 'src/app/models/recipe.model';
import { IPortion } from 'src/app/models/portion.interface';
import { Food } from 'src/app/models/food.model';
import { Meal, PossibleMeals } from 'src/app/models/portion.model';

@Component({
  selector: 'app-select-portion',
  templateUrl: './select-portion.component.html',
  styleUrls: ['./select-portion.component.css']
})
export class SelectPortionComponent implements OnInit, OnDestroy {
  public filteredFoods$: Observable<ReadonlyArray<Food | Recipe>>;
  nameFilter: BehaviorSubject<string> = new BehaviorSubject('');

  public mealSelector: FormControl = new FormControl();
  public searchBox: FormControl = new FormControl();
  public filterForm: FormGroup = new FormGroup({
    mealSelector: this.mealSelector,
    searchBox: this.searchBox
  });

  public diary: Diary;
  public readonly date = this.ds.date;

  private subscription = new Subscription();

  @ViewChild('searchBoxInput', { static: true }) searchBoxInputRef: ElementRef;

  constructor(
    private fs: FoodsService,
    private ds: DiaryService,
    private ui: UiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

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

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
  public proceedWithSelection(selection: Food | Recipe): void {
    if (this.isRecipe(selection)) {
      this.router.navigate(['../add-recipe', selection.id], {
        relativeTo: this.route,
        state: { recipe: selection, meal: this.mealSelector.value }
      });
    } else {
      this.router.navigate([selection.id], {
        relativeTo: this.route,
        state: { meal: this.mealSelector.value, food: selection }
      });
    }
  }

  public get PossibleMeals() {
    return PossibleMeals;
  }

  public isRecipe(portion: Food | Recipe): portion is Recipe {
    return (portion as Recipe).ingredients !== undefined;
  }
}
