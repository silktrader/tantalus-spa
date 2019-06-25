import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodsService } from 'src/app/services/foods.service';
import { Meal } from 'src/app/models/meal.model';
import { Diary } from 'src/app/models/diary.model';

@Component({
  selector: 'app-select-portion',
  templateUrl: './select-portion.component.html',
  styleUrls: ['./select-portion.component.css']
})
export class SelectPortionComponent implements OnInit, OnDestroy {
  public filteredFoods$: Observable<Food[]>;
  nameFilter: BehaviorSubject<string> = new BehaviorSubject('');

  public mealSelector: FormControl = new FormControl();
  public searchBox: FormControl = new FormControl();
  public filterForm: FormGroup = new FormGroup({
    mealSelector: this.mealSelector,
    searchBox: this.searchBox
  });

  public diary: Diary;

  private subscription = new Subscription();

  constructor(
    private foodsService: FoodsService,
    public ds: DiaryService,
    private ui: UiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.filteredFoods$ = this.foodsService.getFilteredFoods(this.nameFilter);

    if (this.route.parent === null) {
      console.log('ERROR');
      return; // tk throw error warn user about wrong URL
    }

    this.mealSelector.setValue(this.ds.focusedMeal);

    this.subscription.add(
      this.ds.diary$.subscribe(diary => (this.diary = diary))
    );

    this.subscription.add(
      this.mealSelector.valueChanges.subscribe(
        value => (this.ds.focusedMeal = value)
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public get availableMeals(): ReadonlyArray<number> {
    return Meal.mealNumbers;
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

  public startFoodCreation(): void {
    this.router.navigate(['/add-food'], {
      queryParams: { name: this.searchBox.value }
    });
  }

  public proceedWithSelection(food: Food): void {
    this.router.navigate([food.id], { relativeTo: this.route });
  }

  public mealName(mealNumber: number) {
    return Meal.mealNames[mealNumber];
  }
}
