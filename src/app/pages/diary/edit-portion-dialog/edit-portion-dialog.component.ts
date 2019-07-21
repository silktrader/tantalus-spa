import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Portion } from 'src/app/models/portion.model';
import { FormControl } from '@angular/forms';
import { Meal } from 'src/app/models/meal.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { MapperService as Mapper, MapperService } from 'src/app/services/mapper.service';
import { PortionDto } from 'src/app/models/portion-dto.model';
import { QuantityEditorComponent } from 'src/app/ui/quantity-editor/quantity-editor.component';

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
  @ViewChild(QuantityEditorComponent, { static: false })
  private quantityEditor: QuantityEditorComponent;

  public readonly mealSelector: FormControl;

  constructor(
    public dialogRef: MatDialogRef<EditPortionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditPortionDialogData
  ) {
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
      () => this.data.ui.warnFailedChangePortion(oldPortion.id)
    );
  }

  public deletePortion(): void {
    this.data.ds.removePortion(this.data.portion.id).subscribe(() => {
      this.data.ui.notifyRemovePortion(this.data.portion.food.name, () => {
        this.data.ds.addPortion(MapperService.toDto(this.data.portion)).subscribe(() => {
          this.dismiss();
          this.data.ui.notifyRestorePortion(this.data.portion.food.name);
        });
      });
    });
  }

  public get saveable(): boolean {
    return (
      this.quantityEditor &&
      this.quantityEditor.valid &&
      (this.quantityEditor.changed || this.mealSelector.value !== this.data.portion.meal)
    );
  }

  public save(): void {
    this.changePortion(Mapper.toDto(this.data.portion), {
      id: this.data.portion.id,
      foodId: this.data.portion.food.id,
      quantity: this.quantityEditor.value,
      meal: this.mealSelector.value
    });
  }

  public dismiss(): void {
    this.dialogRef.close(undefined);
  }

  public getMealName(index: number) {
    return Meal.mealNames[index];
  }

  public get mealNumbers(): ReadonlyArray<number> {
    return Meal.numbers;
  }
}
