import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, combineLatestWith, debounceTime, map, Observable, shareReplay, startWith, tap } from 'rxjs';
import { StatsService } from '../stats.service';

@Component({
  selector: 'app-mood-stats',
  templateUrl: './mood-stats.component.html',
  styleUrls: ['./mood-stats.component.scss']
})
export class MoodStatsComponent implements OnInit {

  controls = new FormGroup({
    records: new FormControl(undefined)
  });

  statSelector = new FormControl('nothing');

  chosenStat$: Observable<string>;

  highMoodFoodsData;

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(private ss: StatsService) { }

  ngOnInit(): void {

    // remember previous values; seems necessary to trigger the combineLatest operator
    this.controls.patchValue({ records: '10' });
    this.statSelector.setValue('nothing');

    this.chosenStat$ = combineLatest([
      this.statSelector.valueChanges.pipe(startWith(this.statSelector.value)),
      this.controls.valueChanges.pipe(startWith(this.controls.value))]).pipe(
        debounceTime(500),
        tap((changes: [string, string]) => {
          this.fetchData(changes[0], changes[1]);
        }),
        map((selector) => {
          return selector[0];
        })
      );
  }

  fetchData(value: string, parameters) {
    console.log(parameters);
    if (value === 'high-mood-foods') {
      this.loading$.next(true);
      this.ss.getHighMoodFoods(parameters).subscribe({
        next: data => {
          this.highMoodFoodsData = data.foods;
          this.loading$.next(false);
        },
        error: error => console.log('issue fetching stat')
      });
    }

  }


}
