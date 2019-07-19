import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Portion } from 'src/app/models/portion.model';
import { FormControl, Validators } from '@angular/forms';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';
import { Meal } from 'src/app/models/meal.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { MapperService as Mapper } from 'src/app/services/mapper.service';
import { PortionDto } from 'src/app/models/portion-dto.model';

export interface EditPortionDialogData {
  readonly portion: Portion;
  readonly ds: DiaryService;
  readonly ui: UiService;
}

@Component({
  selector: 'app-edit-portion-dialog',
  templateUrl: './edit-portion-dialog.component.html',
  styleUrls: ['./edit-portion-dialog.component.css']
})
export class EditPortionDialogComponent implements OnInit {
  public readonly quantityInput: FormControl;
  public readonly mealSelector: FormControl;

  constructor(
    public dialogRef: MatDialogRef<EditPortionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditPortionDialogData
  ) {
    this.quantityInput = new FormControl(data.portion.quantity, [
      Validators.required,
      PortionValidators.quantity
    ]);
    this.mealSelector = new FormControl(data.portion.meal);
  }

  ngOnInit() {}

  private changePortion(oldPortion: PortionDto, newPortion: PortionDto): void {
    this.data.ds.changePortion(newPortion).subscribe(
      () => {
        this.data.ui.notifyChangePortion(
          {
            quantity: oldPortion.quantity,
            meal: oldPortion.meal,
            foodName: this.data.portion.food.name
          },
          newPortion,
          () => {
            this.changePortion(newPortion, oldPortion);
          }
        );
        this.dialogRef.close();
      },
      () => this.data.ui.warn(`Couldn't change portion #${oldPortion.id}`)
    );
  }

  public save(): void {
    this.changePortion(Mapper.toDto(this.data.portion), {
      id: this.data.portion.id,
      foodId: this.data.portion.food.id,
      quantity: this.quantityInput.value,
      meal: this.mealSelector.value
    });
  }

  public dismiss(): void {
    this.dialogRef.close(undefined);
  }

  public getMealName(index: number) {
    return Meal.mealNames[index];
  }

  public get quantityError(): string {
    return PortionValidators.getQuantityError(this.quantityInput);
  }

  public get mealNumbers(): ReadonlyArray<number> {
    return Meal.numbers;
  }
}
