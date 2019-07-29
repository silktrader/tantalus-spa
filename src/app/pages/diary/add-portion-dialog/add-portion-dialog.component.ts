import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { FormControl } from '@angular/forms';
import { QuantityEditorComponent } from 'src/app/ui/quantity-editor/quantity-editor.component';
import { FoodDto } from 'src/app/models/food-dto.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FoodsService } from 'src/app/services/foods.service';
import { IPortion } from 'src/app/models/portion.interface';
import { Observable, Subject } from 'rxjs';
import { RecipeDto } from 'src/app/models/recipe-autocomplete.model';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';

export interface AddPortionDialogData {
  readonly ds: DiaryService;
  readonly ui: UiService;
  readonly fs: FoodsService;
}

@Component({
  selector: 'app-add-portion-dialog',
  templateUrl: './add-portion-dialog.component.html',
  styleUrls: ['./add-portion-dialog.component.css']
})
export class AddPortionDialogComponent {
  @ViewChild(QuantityEditorComponent, { static: false })
  private quantityEditor: QuantityEditorComponent;

  public readonly mealSelector: FormControl;
  public readonly foodInput: FormControl;

  public readonly filteredFoods$: Observable<ReadonlyArray<IPortion>>;
  private readonly filterText$ = new Subject<string>();

  private selectedFood: FoodDto;
  private selectedRecipe: RecipeDto;

  constructor(
    public dialogRef: MatDialogRef<AddPortionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPortionDialogData
  ) {
    this.foodInput = new FormControl();
    this.mealSelector = new FormControl(data.ds.focusedMeal);

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

  public displayFood(foodDto: FoodDto): string | undefined {
    if (foodDto) {
      return foodDto.name;
    }
    return undefined;
  }

  public get quantityEditable(): boolean {
    return true;
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

  public get addingRecipe(): boolean {
    return this.selectedRecipe !== undefined;
  }

  public save(): void {
    if (this.selectedFood) {
      this.data.ds
        .addPortion({
          foodId: this.foodInput.value.id,
          quantity: this.quantityEditor.value,
          meal: this.mealSelector.value
        })
        .subscribe(
          value => {
            this.data.ui.notifyAddedPortion(value.quantity, this.selectedFood.name, () => {
              this.data.ds.removePortion(value.id).subscribe(() => {
                this.data.ui.notifyRemovePortion(this.selectedFood.name, () => {});
              });
            });
            this.dialogRef.close();
          },
          () => {
            this.data.ui.warnFailedAddedPortion(this.selectedFood.name);
            this.dialogRef.close();
          }
        );
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
