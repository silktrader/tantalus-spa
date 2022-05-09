import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable, shareReplay, startWith, tap } from 'rxjs';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { StatsService } from '../stats.service';

export enum MoodStat {
  None = 0,
  HighMoodFoods,
  LowMoodFoods,
  FoodsHighestAverageMood,
  FoodsLowestAverageMood,
  MoodPerCaloricRange
}

@Component({
  selector: 'app-mood-stats',
  templateUrl: './mood-stats.component.html',
  styleUrls: ['./mood-stats.component.scss']
})
export class MoodStatsComponent implements OnInit {

  controls = new FormGroup({
    records: new FormControl(undefined),
    startDate: new FormControl(),
    endDate: new FormControl()
  });

  statSelector = new FormControl('nothing');

  chosenStat$: Observable<MoodStat>;
  showTable$: Observable<boolean>;

  dataSource;

  // declaring the columns at the start ensures they are sortable later
  tableColumns: string[] = ['name', 'total', 'percent', 'averageMood'];

  loading$ = new BehaviorSubject<boolean>(false);

  moodStat = MoodStat;

  // storing the table stats avoids new assignments on each check
  private readonly tableStats = [MoodStat.HighMoodFoods, MoodStat.LowMoodFoods, MoodStat.FoodsHighestAverageMood, MoodStat.FoodsLowestAverageMood];

  @ViewChild(MatSort)
  set sort(matSort: MatSort) {
    if (this.dataSource)
      this.dataSource.sort = matSort;
  }

  @ViewChild(MatPaginator)
  set paginator(matPaginator: MatPaginator) {
    if (this.dataSource)
      this.dataSource.paginator = matPaginator;
  }

  constructor(private ss: StatsService, private ui: UiService) { }

  ngOnInit(): void {

    // remember previous values; seems necessary to trigger the combineLatest operator
    const date = new Date(Date.now());
    date.setFullYear(date.getFullYear() - 1);
    this.controls.patchValue({ records: '15', startDate: date, endDate: new Date(Date.now()) });
    this.statSelector.setValue(MoodStat.None);

    this.chosenStat$ = combineLatest([
      this.statSelector.valueChanges.pipe(startWith(this.statSelector.value)),
      this.controls.valueChanges.pipe(startWith(this.controls.value))]).pipe(
        debounceTime(500),
        tap((changes: [MoodStat, string]) => {
          this.fetchData(changes[0], changes[1]);
        }),
        map((selector) => {
          return selector[0];
        }),
        shareReplay(1)
      );

    // the shareReplay is necessary to ensure that on new subscriptions, from templates appearing, adequate values are available
    this.showTable$ = this.chosenStat$.pipe(
      map(stat => this.tableStats.includes(stat)),
      shareReplay(1)
    );
  }

  fetchData(value: MoodStat, parameters) {
    if (parameters.startDate === null || parameters.endDate === null)
      return;

    parameters = { ...parameters, startDate: DiaryService.toDateUrl(parameters.startDate), endDate: DiaryService.toDateUrl(parameters.endDate) };

    switch (value) {
      case MoodStat.HighMoodFoods: {
        this.loading$.next(true);
        this.ss.getHighMoodFoods(parameters).subscribe({
          next: data => {
            this.dataSource = new MatTableDataSource(data.foods);
            this.tableColumns = ['name', 'total', 'percent'];
            this.loading$.next(false);
          },
          error: error => {
            this.ui.warn('Failed to fetch data from server', error);
            this.loading$.next(false);
          }
        });
        break;
      }

      case MoodStat.LowMoodFoods: {
        this.loading$.next(true);
        this.ss.getLowMoodFoods(parameters).subscribe({
          next: data => {
            this.dataSource = new MatTableDataSource(data.foods);
            this.tableColumns = ['name', 'total', 'percent'];
            this.loading$.next(false);
          },
          error: error => {
            this.ui.warn('Failed to fetch data from server', error);
            this.loading$.next(false);
          }
        });
        break;
      }

      case MoodStat.MoodPerCaloricRange: {
        this.loading$.next(true);
        this.ss.getMoodPerCaloricRange(parameters).subscribe({
          next: data => {
            this.dataSource = data;
            this.loading$.next(false);
          },
          error: error => {
            this.ui.warn('Failed to fetch data from server', error);
            this.loading$.next(false);
          }
        });
        break;
      }

      case MoodStat.FoodsHighestAverageMood: {
        this.loading$.next(true);
        this.ss.getFoodsHighestAverageMood(parameters).subscribe({
          next: data => {
            this.dataSource = new MatTableDataSource(data.foods);
            this.tableColumns = ['name', 'averageMood'];
            this.loading$.next(false);
          },
          error: error => {
            this.ui.warn('Failed to fetch data from server', error);
            this.loading$.next(false);
          }
        });
        break;
      }

      case MoodStat.FoodsLowestAverageMood: {
        this.loading$.next(true);
        this.ss.getFoodsLowestAverageMood(parameters).subscribe({
          next: data => {
            this.dataSource = new MatTableDataSource(data.foods);
            this.tableColumns = ['name', 'averageMood'];
            this.loading$.next(false);
          },
          error: error => {
            this.ui.warn('Failed to fetch data from server', error);
            this.loading$.next(false);
          }
        });
        break;
      }
    }

  }
}