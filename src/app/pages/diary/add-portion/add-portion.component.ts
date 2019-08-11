import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { Portion } from 'src/app/models/portion.model';
import { DiaryService } from 'src/app/services/diary.service';
import { FoodsService } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';

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

  public quantitiesControl = new FormControl('', [Validators.required, PortionValidators.quantity]);
  public mealSelector = new FormControl(undefined);

  public portionForm: FormGroup = new FormGroup({
    quantity: this.quantitiesControl
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ds: DiaryService,
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

    this.subscription.add(this.ds.diary$.subscribe(diary => (this.diary = diary)));

    // attempt to read the selected meal from the state, else fall back on the last used meal
    const meal =
      history.state && Number.isInteger(history.state.meal)
        ? history.state.meal
        : this.ds.focusedMeal;
    this.mealSelector.setValue(meal);

    this.quantitiesControl.setValue(100);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public back(): void {
    this.ui.goBack();
  }

  public get saveDisabled(): boolean {
    return this.quantitiesControl.invalid || this.mealSelector.invalid;
  }

  public save(): void {
    const portionData: PortionAddDto = {
      meal: this.mealSelector.value,
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
        this.ui.warn(`Couldn't record ${this.food.name}`);
      }
    );
  }

  public get mealTypes() {
    return Diary.mealTypes;
  }

  public get quantityError(): string {
    return PortionValidators.getQuantityError(this.quantitiesControl);
  }
}
