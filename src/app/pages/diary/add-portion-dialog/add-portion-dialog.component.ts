import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { QuantityEditorComponent } from 'src/app/ui/quantity-editor/quantity-editor.component';
import { FoodDto } from 'src/app/models/food-dto.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FoodsService } from 'src/app/services/foods.service';
import { IPortion } from 'src/app/models/portion.interface';
import { Observable, Subject } from 'rxjs';
import { RecipeDto } from 'src/app/models/recipe-autocomplete.model';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';
import { Diary } from 'src/app/models/diary.model';

export interface AddPortionDialogData {
  readonly ds: DiaryService;
  readonly ui: UiService;
  readonly fs: FoodsService;
  readonly meal?: number;
}

@Component({
  selector: 'app-add-portion-dialog',
  templateUrl: './add-portion-dialog.component.html',
  styleUrls: ['./add-portion-dialog.component.css'],
  providers: [DiaryService]
})
export class AddPortionDialogComponent {
  @ViewChild(QuantityEditorComponent, { static: false })
  public quantityEditor: QuantityEditorComponent;

  public readonly foodInput = new FormControl(undefined, { validators: Validators.required });
  public readonly mealSelector = new FormControl();

  public readonly mainFormGroup = new FormGroup({
    mealSelector: this.mealSelector,
    foodInput: this.foodInput
  });

  public readonly filteredFoods$: Observable<ReadonlyArray<IPortion>>;
  private readonly filterText$ = new Subject<string>();

  private selectedFood: FoodDto;
  private selectedRecipe: RecipeDto;

  public isMissingPortion = false;

  constructor(
    public dialogRef: MatDialogRef<AddPortionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPortionDialogData
  ) {
    // determine whether to use state or fall back to the latest used meal
    const meal = Number.isInteger(data.meal) ? data.meal : data.ds.focusedMeal;
    this.mealSelector.setValue(meal);

    this.filteredFoods$ = data.fs.getFilteredFoods(this.filterText$);
    this.foodInput.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.selectedFood = undefined;
        this.selectedRecipe = undefined;

        if (typeof value === 'string' && value.length > 2) {
          this.filterText$.next(value);
        } else if (FoodsService.isFoodDto(value)) {
          this.selectedFood = value;
        } else if (FoodsService.isRecipeDto(value)) {
          this.selectedRecipe = value;
        }
      });
  }

  public get saveable(): boolean {
    if (this.selectedFood) {
      return this.quantityEditor && this.quantityEditor.valid;
    } else if (this.selectedRecipe) {
      return true;
    } else {
      return false;
    }
  }

  public get hasQuantityError(): boolean {
    if (this.quantityEditor && this.quantityEditor.dirty && !this.quantityEditor.valid) {
      return true;
    }
    return false;
  }

  public get addingRecipe(): boolean {
    return this.selectedRecipe !== undefined;
  }

  public get mealTypes() {
    return Diary.mealTypes;
  }

  public displayFood(foodDto: FoodDto): string | undefined {
    if (foodDto) {
      return foodDto.name;
    }
    return undefined;
  }

  public checkMissingPortion(): void {
    // nasty hack to allows the quantity editor to steal focus and trigger the `blur` event
    setTimeout(() => {
      this.isMissingPortion = !this.selectedFood && !this.selectedRecipe;
    }, 500);
  }

  public save(): void {
    if (this.selectedFood) {
      this.data.ds
        .addPortion({
          foodId: this.foodInput.value.id,
          quantity: this.quantityEditor.value,
          meal: this.mealSelector.value
        })
        .subscribe({
          next: value => {
            this.data.ui.notifyAddedPortion(value.quantity, this.selectedFood.name, () => {
              this.data.ds.removePortion(value.id).subscribe(() => {
                this.data.ui.notifyRemovedPortion(this.selectedFood.name);
              });
            });
            this.dialogRef.close();
          },
          error: () => {
            this.data.ui.warnFailedAddedPortion(this.selectedFood.name);
            this.dialogRef.close();
          }
        });
    } else if (this.selectedRecipe) {
      const portions: Array<PortionAddDto> = [];
      for (const ingredient of this.selectedRecipe.ingredients) {
        portions.push({
          foodId: ingredient.food.id,
          quantity: ingredient.quantity,
          meal: this.mealSelector.value
        });
      }
      this.data.ds.addPortions(portions).subscribe(
        () => {
          this.data.ui.notifyAddedPortions(portions.length, () => {
            // tk implement mass removal
          });
          this.dialogRef.close();
        },
        () => {
          this.data.ui.warnFailedAddedPortions();
          this.dialogRef.close();
        }
      );
    }
  }
}
