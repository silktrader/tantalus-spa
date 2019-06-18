import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, tap, map, switchMap } from 'rxjs/operators';
import { Meal } from '../models/meal.model';
import { HttpClient } from '@angular/common/http';
import { ShortDate } from '../models/date-ymd.model';
import { PortionDto } from '../models/portion-dto-model';
import { DiaryEntryDto } from '../models/diary-entry-dto.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Diary } from '../models/diary.model';

@Injectable()
export class DiaryService {
  private baseUrl = 'https://localhost:5001/api/diary/';

  private _date: ShortDate;
  public get date(): ShortDate {
    return this._date;
  }

  public diary$ = new BehaviorSubject<Diary>(undefined);

  public focusedMeal: number;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    // tk unsubscribtion?
    this.route.params
      .pipe(
        switchMap(params => {
          // determine date and fetch new data
          const { year, month, day } = params;
          this._date = new ShortDate(year, month, day);
          return this.getDiaryData();
        })
      )
      .subscribe(diaryData => {
        this.diary$.next(new Diary(diaryData));
        this.focusedMeal = this.diary$.value.latestMeal;
      });
  }

  // should this be configurable by users? tk
  public get availableMealsIDs(): ReadonlyArray<number> {
    return Meal.mealIDs;
  }

  private getDiaryData(): Observable<DiaryEntryDto> {
    return this.http.get<DiaryEntryDto>(
      `${this.baseUrl}${this.date.year}/${this.date.month}/${this.date.day}`
    );
  }

  public addPortion(portionDto: PortionDto): Observable<PortionDto> {
    return this.http.post<PortionDto>(
      `${this.baseUrl}${this.date.year}/${this.date.month}/${
        this.date.day
      }/add-portion`,
      portionDto
    );
  }
}
