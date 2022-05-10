import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith, Subject, tap } from 'rxjs';
import { FoodsService, FrequentFood, PortionResource } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';
import { GetStatsParameters, StatsService } from '../stats.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

export enum MoodStat {
  None = 0,
  HighMoodFoods,
  LowMoodFoods,
  FoodsHighestAverageMood,
  FoodsLowestAverageMood,
  MoodPerCaloricRange,
  AverageMoodPerDoW
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

  readonly statSelector = new FormControl('nothing');
  readonly includedControl = new FormControl(undefined);
  readonly separators: ReadonlyArray<number> = [ENTER, COMMA];

  chosenStat$: Observable<MoodStat>;
  showTable$: Observable<boolean>;

  dataSource;

  // declaring the columns at the start ensures they are sortable later
  tableColumns: string[] = ['name', 'total', 'percent', 'averageMood'];
  daysOfTheWeek: ReadonlyArray<string> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  loading$ = new BehaviorSubject<boolean>(false);

  includedFoods$ = new BehaviorSubject<ReadonlyArray<PortionResource>>([]);
  readonly filteredFoods$: Observable<ReadonlyArray<PortionResource>>;
  private readonly filterText$ = new Subject<string>();

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

  @ViewChild('includedInput') includedInput: ElementRef<HTMLInputElement>;

  constructor(private ss: StatsService, private ui: UiService, private fs: FoodsService) {
    this.filteredFoods$ = this.fs.getFilteredFoods(this.filterText$);
    this.includedControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (typeof value === 'string' && value.length > 2) {
          this.filterText$.next(value);
        }
      });
  }

  ngOnInit(): void {

    // remember previous values; seems necessary to trigger the combineLatest operator
    const date = new Date(Date.now());
    date.setFullYear(date.getFullYear() - 1);
    this.controls.patchValue({ records: '15', startDate: date, endDate: new Date(Date.now()) });
    this.statSelector.setValue(MoodStat.None);

    this.chosenStat$ = combineLatest([
      this.statSelector.valueChanges.pipe(startWith(this.statSelector.value)),
      this.controls.valueChanges.pipe(startWith(this.controls.value)),
      this.includedFoods$]).pipe(
        debounceTime(500),
        tap(([stat, parameters, foods]) => {
          this.fetchData(stat, { ...parameters, included: foods.map(food => food.id) });
        }),
        map(([stat,]) => {
          return stat;
        }),
        shareReplay(1)
      );

    // the shareReplay is necessary to ensure that on new subscriptions, from templates appearing, adequate values are available
    this.showTable$ = this.chosenStat$.pipe(
      map(stat => this.tableStats.includes(stat)),
      shareReplay(1)
    );
  }

  fetchData(value: MoodStat, parameters: GetStatsParameters) {

    // tk check whether relevant
    if (parameters.startDate === null || parameters.endDate === null)
      return;

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

      case MoodStat.AverageMoodPerDoW: {
        this.loading$.next(true);
        this.ss.getAverageMoodPerDoW(parameters).subscribe({
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

  public displayFood(food: FrequentFood): string {
    return food?.name ?? '';
  }

  removeIncludedFood(includedFood: PortionResource): void {
    this.includedFoods$.next([
      ...this.includedFoods$.value.filter((food) => food.id !== includedFood.id),
    ]);
  }

  /** Add new tags from the tags text input */
  addFood(event: MatChipInputEvent): void {
    const input = event.input;

    console.log(event);
    const value = event.value;

    // add tag
    if ((value || '').trim()) {
      // this.includedFoods$.next([...this.includedFoods$.value, value.trim()]);
      this.includedFoods$.next([...this.includedFoods$.value]);
    }

    // reset the input for new tags to be entered
    if (input) input.value = '';
    this.includedControl.setValue(null);
  }

  /** Select tags from the autocomplete menu */
  selectIncluded(event: MatAutocompleteSelectedEvent): void {
    this.includedFoods$.next([...this.includedFoods$.value, event.option.value]);
    this.includedInput.nativeElement.value = '';
    this.includedControl.setValue(null);
  }

  /** Remove partially entered foods, ones that weren't confirmed with delimiters */
  public clearIncluded(): void {
    this.includedInput.nativeElement.value = '';
  }

}