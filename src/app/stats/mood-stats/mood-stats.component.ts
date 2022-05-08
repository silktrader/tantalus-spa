import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable, startWith, tap } from 'rxjs';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { StatsService } from '../stats.service';

export enum MoodStat {
  None = 0,
  HighMoodFoods,
  LowMoodFoods,
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

  dataSource;

  loading$ = new BehaviorSubject<boolean>(false);

  moodStat = MoodStat;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

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
        })
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
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
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
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
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
    }

  }


}
