import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, map, merge, startWith, tap } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';
import { EditWeightDialogComponent } from 'src/app/weight/edit-weight-dialog/edit-weight-dialog.component';
import { GetStatsParameters, StatsService } from '../stats.service';

export enum WeightStat {
  None = 0,
  All,
}

@Component({
  selector: 'app-weight-stats',
  templateUrl: './weight-stats.component.html',
  styleUrls: ['./weight-stats.component.scss']
})
export class WeightStatsComponent implements OnInit, AfterViewInit {

  readonly weightStat = WeightStat;
  readonly controls = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  tableColumns: string[] = [];

  readonly statSelector = new FormControl('nothing');
  readonly hideTable$ = new BehaviorSubject<boolean>(true);

  data = [];
  dataLength = 0;

  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly refresh$ = new BehaviorSubject<boolean>(true);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private ss: StatsService, private ui: UiService, private dialog: MatDialog) { }

  ngOnInit(): void {
    const date = new Date(Date.now());
    date.setFullYear(date.getFullYear() - 1);
    this.controls.patchValue({ start: date, end: new Date(Date.now()) });
    this.statSelector.setValue(WeightStat.None);
  }

  ngAfterViewInit(): void {

    combineLatest([
      this.statSelector.valueChanges.pipe(startWith(this.statSelector.value)),
      this.controls.valueChanges.pipe(startWith(this.controls.value)),
      merge(this.sort.sortChange, this.paginator.page).pipe(startWith({})),
      this.refresh$
    ]).pipe(
      tap(([stat, parameters]) => {
        this.fetchData(stat, { ...parameters, pageIndex: this.paginator.pageIndex, pageSize: this.paginator.pageSize, sort: this.sort.active, direction: this.sort.direction });
      }),
      map(([stat]) => {
        return stat;
      }),
    ).subscribe();
  }

  fetchData(stat: WeightStat, parameters: GetStatsParameters) {

    switch (stat) {
      case WeightStat.All: {
        this.loading$.next(true);
        this.ss.getAllWeightMeasurements(parameters).subscribe({
          next: data => {
            this.data = data.measurements;
            this.dataLength = data.count;
            this.tableColumns = ['measuredOn', 'weight', 'fat'];
            this.loading$.next(false);
            this.hideTable$.next(false);
          },
          error: error => {
            this.ui.warn('Failed to fetch data from server', error);
            this.loading$.next(false);
            this.hideTable$.next(true);
          }
        });
        break;
      }
    }
  }

  edit(measurement) {
    this.dialog.open(EditWeightDialogComponent, {
      data: {
        service: this.ss,
        ui: this.ui,
        weightData: {
          measuredOn: measurement.measuredOn,
          weight: measurement.weight,
          fat: measurement.fat,
          note: measurement.note
        }
      },
    }).afterClosed().subscribe(result => {
      if (result.updated)
        this.refresh$.next(true);
    });
  }

}
