import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { QuantityEditorComponent } from 'src/app/ui/quantity-editor/quantity-editor.component';
import { FoodDto } from 'src/app/models/food-dto.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FoodsService, PortionResource } from 'src/app/services/foods.service';
import { Observable, Subject } from 'rxjs';
import { PossibleMeals } from 'src/app/models/portion.model';

export interface AddPortionDialogData {
  readonly ds: DiaryService;
  readonly meal?: number;
}

@Component({
  selector: 'app-add-portion-dialog',
  templateUrl: './add-portion-dialog.component.html',
  styleUrls: ['./add-portion-dialog.component.css']
})
export class AddPortionDialogComponent {
  @ViewChild(QuantityEditorComponent)
  public quantityEditor: QuantityEditorComponent;

  public readonly foodInput = new FormControl(undefined, { validators: Validators.required });
  public readonly mealSelector = new FormControl();

  public readonly mainFormGroup = new FormGroup({
    mealSelector: this.mealSelector,
    foodInput: this.foodInput
  });

  public readonly filteredFoods$: Observable<ReadonlyArray<PortionResource>>;
  private readonly filterText$ = new Subject<string>();

  private selectedResource: PortionResource;

  public isMissingPortion = false;

  constructor(
    public dialogRef: MatDialogRef<AddPortionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPortionDialogData,
    private fs: FoodsService,
    private ui: UiService
  ) {
    // determine whether to use state or fall back to the latest used meal
    const meal = Number.isInteger(data.meal) ? data.meal : data.ds.focusedMeal;
    this.mealSelector.setValue(meal);

    this.filteredFoods$ = this.fs.getFilteredFoods(this.filterText$);
    this.foodInput.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {

        this.selectedResource = undefined;    // tk necessary?

        if (typeof value === 'string' && value.length > 2) {
          this.filterText$.next(value);
        } else {
          this.selectedResource = value;
        }
      });
  }

  public get saveable(): boolean {
    if (this.selectedResource.isRecipe) return true;
    if (this.selectedResource.isRecipe === false && this.quantityEditor && this.quantityEditor.valid) return true;
    return false;
  }

  public get hasQuantityError(): boolean {
    if (this.quantityEditor && this.quantityEditor.dirty && !this.quantityEditor.valid) {
      return true;
    }
    return false;
  }

  public get addingRecipe(): boolean {
    return this.selectedResource.isRecipe;
  }

  public get PossibleMeals() {
    return PossibleMeals;
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
      this.isMissingPortion = !this.selectedResource;
    }, 500);
  }

  public save(): void {
    if (!this.selectedResource.isRecipe) {
      this.data.ds
        .addPortion({
          foodId: this.foodInput.value.id,
          quantity: this.quantityEditor.value,
          meal: this.mealSelector.value
        })
        .subscribe({
          next: value => {
            this.ui.notifyAddedPortion(value.quantity, this.selectedResource.name, () => {
              this.data.ds.removePortion(value.id).subscribe(() => {
                this.ui.notifyRemovedPortion(this.selectedResource.name);
              });
            });
            this.dialogRef.close();
          },
          error: () => {
            this.ui.warnFailedAddedPortion(this.selectedResource.name);
            this.dialogRef.close();
          }
        });
    } else if (this.selectedResource.isRecipe) {
      // const portions: Array<PortionAddDto> = [];
      // for (const ingredient of this.selectedRecipe.ingredients) {
      //   portions.push({
      //     foodId: ingredient.food.id,
      //     quantity: ingredient.quantity,
      //     meal: this.mealSelector.value
      //   });
      // }
      // this.data.ds.addPortions(portions).subscribe(
      //   () => {
      //     this.ui.notifyAddedPortions(portions.length, () => {
      //       // tk implement mass removal
      //     });
      //     this.dialogRef.close();
      //   },
      //   () => {
      //     this.ui.warnFailedAddedPortions();
      //     this.dialogRef.close();
      //   }
      // );
    }
  }
}
