import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { Portion } from 'src/app/models/portion.model';
import { DiaryService } from 'src/app/services/diary.service';
import { FoodsService } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';
import { PortionQuantityValidator } from 'src/app/validators/portion-quantity.validator';
import { PortionDto } from 'src/app/models/portion-dto-model';
import { Diary } from 'src/app/models/diary.model';
import { Meal } from 'src/app/models/meal.model';

@Component({
  selector: 'app-add-portion',
  templateUrl: './add-portion.component.html',
  styleUrls: ['./add-portion.component.css']
})
export class AddPortionComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public food: Food;
  public previewedPortion: Portion;

  public quantitiesControl = new FormControl('', [
    Validators.required,
    PortionQuantityValidator
  ]);
  public mealSelector = new FormControl('');

  public portionForm: FormGroup = new FormGroup({
    quantity: this.quantitiesControl
  });

  public get diary$(): Observable<Diary> {
    return this.ds.diary$;
  }

  constructor(
    private route: ActivatedRoute,
    private ds: DiaryService,
    private fs: FoodsService,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.subscription = this.route.params
      .pipe(
        switchMap((params: Params) => {
          const foodID = params.foodID;
          return this.fs.getFood(foodID);
        })
      )
      .subscribe(food => {
        if (food === undefined) {
          this.back();
          return;
        }

        this.previewedPortion = new Portion(undefined, 100, food, 0);
        this.food = food;
      });

    this.mealSelector.setValue(this.ds.focusedMeal);
    this.quantitiesControl.setValue(100);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public get availableMeals(): ReadonlyArray<number> {
    return Meal.mealIDs;
  }

  getQuantitiesControlError() {
    if (this.quantitiesControl.hasError('required')) {
      return 'Required';
    }
    if (this.quantitiesControl.hasError('integer')) {
      return 'No decimals';
    }
    if (this.quantitiesControl.hasError('range')) {
      return 'Must be within [0, 5,000] grams';
    }
    return '';
  }

  public back(): void {
    this.ui.goBack();
  }

  public get saveDisabled(): boolean {
    return this.quantitiesControl.invalid || this.mealSelector.invalid;
  }

  public save(): void {
    const portionData: PortionDto = {
      mealNumber: this.mealSelector.value,
      foodId: this.food.id,
      quantity: this.quantitiesControl.value
    };

    this.ds.addPortion(portionData).subscribe(
      data => {
        this.back();
        this.ui.notify(`Added ${this.food.name}`, 'Undo', () => {
          // this.ds.removePortion(data);
        });
      },
      error => {
        console.log(error);
        this.ui.warn(`Couldn't record ${this.food.name}`);
      }
    );
  }
}
