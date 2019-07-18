import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Portion } from 'src/app/models/portion.model';
import { FormControl, Validators } from '@angular/forms';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';
import { Meal } from 'src/app/models/meal.model';

export interface EditPortionDialogData {
  portion: Portion;
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
    this.mealSelector = new FormControl(data.portion.mealNumber);
  }

  ngOnInit() {}

  public dismiss(): void {
    this.dialogRef.close();
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
