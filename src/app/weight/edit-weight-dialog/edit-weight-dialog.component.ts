import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, distinctUntilChanged, tap } from 'rxjs';
import { WeightMeasurement } from 'src/app/models/weightMeasurement';
import { UiService } from 'src/app/services/ui.service';
import { StatsService } from 'src/app/stats/stats.service';

@Component({
  selector: 'app-edit-weight-dialog',
  templateUrl: './edit-weight-dialog.component.html',
  styleUrls: ['./edit-weight-dialog.component.scss']
})
export class EditWeightDialogComponent implements OnInit {

  readonly weightForm = new FormGroup({
    measuredOn: new FormControl(),
    weight: new FormControl(),
    fat: new FormControl(),
    note: new FormControl()
  });

  readonly disabledSave$ = new BehaviorSubject(true);

  constructor(public dialogRef: MatDialogRef<EditWeightDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {
    service: StatsService,
    ui: UiService,
    weightData: WeightMeasurement
  }) { }

  ngOnInit(): void {
    const date = new Date(this.data.weightData.measuredOn);
    this.weightForm.patchValue({
      ... this.data.weightData,
      measuredOn: `${date.toISOString().substring(0, 10)}T${date.toLocaleTimeString().substring(0, 5)}`,
      weight: this.data.weightData.weight / 1000,
    });

    this.weightForm.statusChanges.pipe(
      distinctUntilChanged(),
      tap(() => this.disabledSave$.next(this.weightForm.invalid || !this.weightForm.dirty))
    ).subscribe();
  }

  delete(): void {
    console.log("deleting");
  }

  save(): void {
    this.data.service.updateWeightMeasurement({
      ...this.weightForm.value,
      weight: this.weightForm.value.weight * 1000,
      measuredOn: new Date(this.weightForm.value.measuredOn)
    }).subscribe({
      complete: () => {
        this.data.ui.notify(`Updated weight measurement`);
        this.dialogRef.close({ updated: true });
      },
      error: error => {
        this.data.ui.warn(`Couldn't update weight measurement`);
        console.log(error);
      }
    });
  }

}
