import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { Portion } from 'src/app/models/portion.model';
import { DiaryService } from 'src/app/services/diary.service';
import { FoodsService } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';
import { NgxChartEntry } from '../diary-summary/diary-summary.component';
import { FoodProp } from 'src/app/models/food-prop.model';

@Component({
  selector: 'app-add-portion',
  templateUrl: './add-portion.component.html',
  styleUrls: ['./add-portion.component.css']
})
export class AddPortionComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public diary: Diary;
  public food: Food;
  public previewedPortion: Portion;

  public mealSelector = new FormControl(undefined);
  public quantityInput = new FormControl(100, [Validators.required, PortionValidators.quantity]);

  public chartData: { calories: ReadonlyArray<NgxChartEntry> };

  constructor(
    private route: ActivatedRoute,
    private ds: DiaryService,
    private fs: FoodsService,
    private ui: UiService
  ) {}

  ngOnInit() {
    // attempt to read the selected meal from the state, else fall back on the last used meal
    const meal =
      history.state && Number.isInteger(history.state.meal)
        ? history.state.meal
        : this.ds.focusedMeal;
    this.mealSelector.setValue(meal);

    this.subscription = this.route.params
      .pipe(
        switchMap((params: Params) => {
          // check whether a food was passed to the route; must create food from serialised data
          if (history.state && history.state.food) {
            return of(new Food(history.state.food.data));
          }

          return this.fs.getFood(params.foodID);
        })
      )
      .subscribe((food: Food) => {
        if (food === undefined) {
          this.back();
          return;
        }

        this.previewedPortion = new Portion(undefined, 100, food, meal);
        this.chartData = this.getChartData();

        // assign food last to trigger the display of all related informations
        this.food = food;
      });

    this.subscription.add(this.ds.diary$.subscribe(diary => (this.diary = diary)));

    // create a new preview each time the value is changed
    this.subscription.add(
      this.quantityInput.valueChanges.subscribe(newValue => {
        this.previewedPortion = new Portion(
          undefined,
          this.quantityInput.valid ? newValue : 0,
          this.food,
          this.mealSelector.value
        );
        this.chartData = this.getChartData();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public back(): void {
    this.ui.goBack();
  }

  public get show(): boolean {
    return this.food !== undefined;
  }

  public get saveDisabled(): boolean {
    return this.quantityInput.invalid || this.mealSelector.invalid;
  }

  public save(): void {
    const portionData: PortionAddDto = {
      meal: this.mealSelector.value,
      foodId: this.food.id,
      quantity: this.quantityInput.value
    };

    this.ds.addPortion(portionData).subscribe({
      next: () => {
        this.back();
        this.ui.notify(`Added ${this.food.name}`, 'Undo', () => {
          // this.ds.removePortion(data);
        });
      },
      error: () => {
        this.ui.warn(`Couldn't record ${this.food.name}`);
      }
    });
  }

  public get mealTypes() {
    return Diary.mealTypes;
  }

  public get quantityError(): string {
    return PortionValidators.getQuantityError(this.quantityInput);
  }

  public addGrams(quantity: number) {
    this.quantityInput.setValue(this.quantityInput.value + quantity);
  }

  public getChartData(): { calories: Array<NgxChartEntry> } {
    return {
      calories: [
        { name: FoodProp.proteins, value: this.previewedPortion.proteins },
        { name: FoodProp.carbs, value: this.previewedPortion.carbs },
        { name: FoodProp.fats, value: this.previewedPortion.fats },
        { name: FoodProp.alcohol, value: this.previewedPortion.alcohol }
      ]
    };
  }

  public get macronutrientsScheme() {
    return this.ui.chartsConfiguration.macronutrientsScheme;
  }
}
