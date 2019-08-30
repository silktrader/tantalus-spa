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
import { DtoMapper } from 'src/app/services/dto-mapper';

@Component({
  selector: 'app-edit-portion-fullscreen',
  templateUrl: './edit-portion-fullscreen.component.html',
  styleUrls: ['./edit-portion-fullscreen.component.css']
})
export class EditPortionFullscreenComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  public diary: Diary;
  private originalPortion: Portion;

  // tslint:disable-next-line: variable-name
  public _previewedPortion: Portion;
  public get previewedPortion(): Portion {
    return this._previewedPortion;
  }
  public set previewedPortion(portion: Portion) {
    this._previewedPortion = portion;
    // populate new chart data every time the preview changes
    this.chartData = this.getChartData();
  }

  public mealSelector = new FormControl(undefined);
  public quantityInput = new FormControl(100, [Validators.required, PortionValidators.quantity]);

  public chartData: { calories: ReadonlyArray<NgxChartEntry> };

  constructor(
    private route: ActivatedRoute,
    private ds: DiaryService,
    private fs: FoodsService,
    private ui: UiService,
    private mapper: DtoMapper
  ) {}

  ngOnInit() {
    // check which route is triggered
    const portionId = this.route.snapshot.paramMap.get('portionId');
    if (portionId === null) {
      this.initAddPortion();
    } else {
      this.initEditPortion(+portionId);
    }

    // create a new preview each time the value is changed
    this.subscription.add(
      this.quantityInput.valueChanges.subscribe(newValue => {
        this.previewedPortion = new Portion(
          this.previewedPortion.id,
          this.quantityInput.valid ? newValue : 0,
          this.previewedPortion.food,
          this.previewedPortion.meal
        );
      })
    );

    this.subscription.add(
      this.mealSelector.valueChanges.subscribe(newValue => {
        this.previewedPortion = new Portion(
          this.previewedPortion.id,
          this.previewedPortion.quantity,
          this.previewedPortion.food,
          newValue
        );
      })
    );
  }

  private initAddPortion() {
    // attempt to read the selected meal from the state, else fall back on the last used meal
    const meal =
      history.state && Number.isInteger(history.state.meal)
        ? history.state.meal
        : this.ds.focusedMeal;
    this.mealSelector.setValue(meal);

    this.subscription.add(
      this.route.params
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
        })
    );

    this.subscription.add(this.ds.diary$.subscribe(diary => (this.diary = diary)));
  }

  private initEditPortion(id: number) {
    this.subscription.add(
      this.ds.diary$.subscribe(diary => {
        // tk pass portion with route state

        if (diary === undefined) {
          return;
          // tk handle errors
        }

        this.originalPortion = diary.getPortion(id);
        if (this.originalPortion === undefined) {
          return;
          // tk handle errors?
        }

        this.diary = diary;
        this.previewedPortion = this.originalPortion;
        this.mealSelector.setValue(this.originalPortion.meal);
        this.quantityInput.setValue(this.originalPortion.quantity);
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
    return this.previewedPortion !== undefined;
  }

  public get addingNewPortion(): boolean {
    return this.originalPortion === undefined;
  }

  public get saveDisabled(): boolean {
    return this.quantityInput.invalid || this.mealSelector.invalid || this.undoDisabled;
  }

  public get undoDisabled(): boolean {
    return (
      this.originalPortion &&
      this.originalPortion.quantity === this.previewedPortion.quantity &&
      this.originalPortion.meal === this.previewedPortion.meal
    );
  }

  public save(): void {
    const portionData: PortionAddDto = {
      meal: this.mealSelector.value,
      foodId: this.previewedPortion.food.id,
      quantity: this.quantityInput.value
    };

    this.ds.addPortion(portionData).subscribe({
      next: () => {
        // tk add save undo
        this.ui.notifyAddedPortion(portionData.quantity, this.previewedPortion.food.name, () => {});
        this.back();
      },
      error: () => {
        this.ui.warnFailedAddedPortion(this.previewedPortion.food.name);
      }
    });
  }

  public change(): void {
    this.changePortion(this.originalPortion, this.previewedPortion);
  }

  // takes arguments so it can triggers itself to undo removals
  private changePortion(initial: Portion, final: Portion): void {
    this.ds.changePortion(this.mapper.mapPortionDto(final)).subscribe({
      next: () => {
        this.ui.notifyChangePortion(
          {
            quantity: initial.quantity,
            meal: initial.meal,
            foodName: initial.food.name
          },
          {
            quantity: final.quantity,
            meal: initial.meal
          },
          () => {
            this.changePortion(final, initial);
          }
        );
        this.back();
      },
      error: () => this.ui.warnFailedChangePortion(initial.id)
    });
  }

  public undo(): void {
    this.mealSelector.setValue(this.originalPortion.meal);
    this.quantityInput.setValue(this.originalPortion.quantity);
  }

  public delete(): void {
    // cache the portion to avoid missing references when updating the diary
    const deletedPortion = this.originalPortion;
    this.ds.removePortion(this.originalPortion.id).subscribe({
      next: () => {
        this.ui.notifyRemovedPortion(deletedPortion.food.name, () => {
          this.ds.addPortion(this.mapper.mapPortionDto(deletedPortion)).subscribe(() => {
            this.ui.notifyRestorePortion(deletedPortion.food.name);
          });
        });
        this.back();
      },
      error: () => this.ui.warnFailedRemoval(deletedPortion.id)
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
