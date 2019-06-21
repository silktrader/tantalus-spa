import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, tap, map, switchMap } from 'rxjs/operators';
import { Meal } from '../models/meal.model';
import { HttpClient } from '@angular/common/http';
import { PortionDto } from '../models/portion-dto-model';
import { DiaryEntryDto } from '../models/diary-entry-dto.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Diary } from '../models/diary.model';
import { PortionAddDto } from '../models/portion-add-dto.model';

@Injectable()
export class DiaryService {
  private baseUrl = 'https://localhost:5001/api/diary/';

  private dateUrl: string;
  private _date: Date;
  public get date(): Date {
    return this._date;
  }

  private readonly diarySubject$ = new BehaviorSubject<Diary>(undefined);
  public readonly diary$ = this.diarySubject$.asObservable();

  public focusedMeal: number;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    // tk unsubscribtion?
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          // determine date and fetch new data
          const { year, month, day } = params;
          this.dateUrl = `${year}/${month}/${day}`;
          this._date = new Date(year, month, day);
          return this.getDiaryData();
        })
      )
      .subscribe(diaryDto => {
        if (diaryDto) {
          this.diarySubject$.next(new Diary(diaryDto));
          this.focusedMeal = this.diarySubject$.value.latestMeal;
        } else {
          this.diarySubject$.next(undefined);
        }
      });
  }

  // should this be configurable by users? tk
  public get availableMealsIDs(): ReadonlyArray<number> {
    return Meal.mealNumbers;
  }

  private getDiaryData(): Observable<DiaryEntryDto> {
    return this.http.get<DiaryEntryDto>(`${this.baseUrl}${this.dateUrl}`);
  }

  public addPortion(portionDto: PortionAddDto): Observable<PortionDto> {
    return this.http.post<PortionDto>(
      `${this.baseUrl}${this.dateUrl}/add-portion`,
      portionDto
    );
  }

  public changePortion(portionDto: PortionDto): Observable<PortionDto> {
    return this.http.put<PortionDto>(
      `${this.baseUrl}${this.dateUrl}/${portionDto.id}`,
      portionDto
    );
  }

  public removePortion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.dateUrl}/${id}`);
  }
}
