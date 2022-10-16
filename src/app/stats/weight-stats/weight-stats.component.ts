import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, filter, map, merge, skipWhile, startWith, tap } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';
import { EditWeightDialogComponent } from 'src/app/weight/edit-weight-dialog/edit-weight-dialog.component';
import { GetStatsParameters, StatsService } from '../stats.service';

export enum WeightStat {
  None = 0,
  All,
  Duplicates,
  MonthlyChanges,
}

@Component({
  selector: 'app-weight-stats',
  templateUrl: './weight-stats.component.html',
  styleUrls: ['./weight-stats.component.scss']
})
export class WeightStatsComponent implements OnInit, AfterViewInit {

  readonly statistics: { id: WeightStat, columns: string[], initDirection: 'asc' | 'desc' }[] = [
    {
      id: WeightStat.None,
      columns: [],
      initDirection: 'desc'
    }, {
      id: WeightStat.All,
      columns: ['measuredOn', 'weight', 'fat'],
      initDirection: 'desc'
    }, {
      id: WeightStat.Duplicates,
      columns: ['measuredOn', 'weight', 'fat', 'secondsAfter', 'weightChange', 'fatChange'],
      initDirection: 'desc'
    }, {
      id: WeightStat.MonthlyChanges,
      columns: ['month', 'weight', 'weightChange', 'fat', 'fatChange', 'recordedMeasures', 'monthlyAvgCalories', 'caloriesChange', 'recordedDays'],
      initDirection: 'desc'
    },
  ];

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
  preparingQuery = false;       /// used to disable sort observable triggering two queries

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

    // the sorter must be reinitialised (before other observables), so to avoid invalid properties
    this.statSelector.valueChanges.pipe(
      tap(index => {
        this.preparingQuery = true;
        const stat = this.statistics[index];
        this.sort.sort({ id: stat.columns[0], start: stat.initDirection, disableClear: false });
        this.paginator.pageIndex = 0;
        this.preparingQuery = false;
      })
    ).subscribe();

    combineLatest([
      this.statSelector.valueChanges.pipe(startWith(this.statSelector.value)),
      this.controls.valueChanges.pipe(startWith(this.controls.value)),
      merge(
        this.sort.sortChange,
        this.paginator.page).pipe(startWith({}), filter(() => !this.preparingQuery)),
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

    const selection = this.statistics[stat];

    switch (selection.id) {
      case WeightStat.All: {
        this.loading$.next(true);
        this.ss.getAllWeightMeasurements(parameters).subscribe({
          next: data => {
            this.tableColumns = selection.columns;
            this.data = data.records;
            this.dataLength = data.total;
            this.loading$.next(false);
            this.hideTable$.next(false);
          },
          error: error => this.handleTableDataError(error)
        });
        break;
      }

      case WeightStat.Duplicates: {
        this.loading$.next(true);
        this.ss.getDuplicateWeights(parameters).subscribe({
          next: data => {
            this.tableColumns = selection.columns;
            this.data = data.records;
            this.dataLength = data.total;
            this.loading$.next(false);
            this.hideTable$.next(false);
          },
          error: error => this.handleTableDataError(error)
        });
      }
        break;

      case WeightStat.MonthlyChanges: {
        this.loading$.next(true);
        this.ss.getWeightMonthlyChanges(parameters).subscribe({
          next: data => {
            this.tableColumns = selection.columns;
            this.data = data.records;
            this.dataLength = data.total;
            this.loading$.next(false);
            this.hideTable$.next(false);
          },
          error: error => this.handleTableDataError(error)
        });
      }
        break;

      default:
        break;
    }
  }

  private handleTableDataError(error: any): void {
    this.ui.warn('Failed to fetch data from server', error);
    this.loading$.next(false);
    this.hideTable$.next(true);
  }

  edit(row) {

    // check whether the row contains editable data
    if (!row.measuredOn)
      return;

    this.dialog.open(EditWeightDialogComponent, {
      data: {
        service: this.ss,
        ui: this.ui,
        weightData: {
          measuredOn: row.measuredOn,
          weight: row.weight,
          fat: row.fat,
          note: row.note
        }
      },
    }).afterClosed().subscribe(result => {
      if (result.updated)
        this.refresh$.next(true);
    });
  }

  formatSeconds(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds - mins * 60;

    return `${mins > 0 ? mins + " m. " : ''}${secs + " s."}`;
  }

}
