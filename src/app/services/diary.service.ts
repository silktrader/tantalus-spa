import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, shareReplay, map } from 'rxjs/operators';
import { Meal } from '../models/meal.model';
import { HttpClient } from '@angular/common/http';
import { PortionDto } from '../models/portion-dto-model';
import { DiaryEntryDto } from '../models/diary-entry-dto.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Diary } from '../models/diary.model';
import { PortionAddDto } from '../models/portion-add-dto.model';
import { FoodDto } from '../models/food-dto.model';
import { HubService } from './hub.service';

@Injectable()
export class DiaryService implements OnDestroy {
  private readonly baseUrl = 'https://localhost:5001/api/diary/';

  private readonly diarySubject$ = new BehaviorSubject<Diary>(undefined);
  public readonly diary$ = this.diarySubject$.asObservable();

  public focusedMeal = 0;

  private pDateUrl: string;
  private get dateUrl(): string {
    return this.pDateUrl;
  }

  private pDate: Date;
  public get date(): Date {
    return this.pDate;
  }

  private setDate(date: Date) {
    this.pDate = date;
    this.pDate.setUTCHours(0, 0, 0);
    this.pDateUrl = this.pDate.toISOString().substring(0, 10);
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private hub: HubService
  ) {
    // tk unsubscribtion?
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          switch (params.date) {
            case 'today': {
              this.setDate(new Date());
              break;
            }
            case 'yesterday': {
              const date = new Date();
              date.setDate(date.getDate() - 1);
              this.setDate(date);
              break;
            }
            case 'tomorrow': {
              const date = new Date();
              date.setDate(date.getDate() + 1);
              this.setDate(date);
              break;
            }
            default:
              this.setDate(new Date(params.date));
          }

          return this.getDiaryData();
        })
      )
      .subscribe(diaryDto => this.setDiaryData(diaryDto));

    this.hub.register(
      this.constructor.name,
      'EntryAdd',
      (dto: DiaryEntryDto) => {
        this.setDiaryData(dto);
      }
    );

    this.hub.register(
      this.constructor.name,
      'PortionEdit',
      (portionDto: PortionDto) => {
        const newState = { ...this.diarySubject$.getValue().dto };
        // select the portion to be edited in the new state
        for (const portion of newState.portions) {
          if (portion.id === portionDto.id) {
            portion.mealNumber = portionDto.mealNumber;
            portion.quantity = portionDto.quantity;
          }
        }
        this.diarySubject$.next(new Diary(newState));
      }
    );

    this.hub.register(
      this.constructor.name,
      'PortionAdd',
      (response: { portion: PortionDto; food: FoodDto }) => {
        const newState = { ...this.diarySubject$.getValue().dto };
        newState.portions.push(response.portion);
        newState.foods.push(response.food); // the constructor handles duplicates
        this.diarySubject$.next(new Diary(newState));
      }
    );

    this.hub.register(
      this.constructor.name,
      'PortionRemove',
      (response: { id: number; foodId: number }) => {
        const newState = { ...this.diarySubject$.getValue().dto };

        // check which portion and foods to delete from current state
        let deleteFood = true;
        let deletedPortionIndex: number;
        for (let i = 0; i < newState.portions.length; i++) {
          if (newState.portions[i].id === response.id) {
            deletedPortionIndex = i;
          } else if (newState.portions[i].foodId === response.foodId) {
            deleteFood = false;
          }
        }

        // delete portion
        newState.portions.splice(deletedPortionIndex);

        // delete food
        if (deleteFood) {
          for (let i = 0; i < newState.foods.length; i++) {
            if (newState.foods[i].id === response.foodId) {
              newState.foods.splice(i); // tk modifying collection while iterating
              break;
            }
          }
        }
        this.diarySubject$.next(new Diary(newState));
      }
    );

    this.hub.register(
      this.constructor.name,
      'DiaryDelete',
      (response: { date: string }) => {
        if (response.date.substring(0, 10) === this.dateUrl) {
          this.diarySubject$.next(undefined);
        }
      }
    );
  }

  // should this be configurable by users? tk
  public get availableMealsIDs(): ReadonlyArray<number> {
    return Meal.mealNumbers;
  }

  getMealName(id: number): string {
    return Meal.getName(id);
  }

  getRecordedPortions(mealId: number): number {
    if (this.diarySubject$.value === undefined) {
      return 0;
    }
    return this.diarySubject$.value.recordedMeals(mealId);
  }

  ngOnDestroy(): void {
    this.hub.deregisterAll(this.constructor.name);
  }

  private getDiaryData(): Observable<DiaryEntryDto> {
    return this.http.get<DiaryEntryDto>(`${this.baseUrl}${this.dateUrl}`);
  }

  private setDiaryData(diaryDto: DiaryEntryDto): void {
    if (diaryDto) {
      this.diarySubject$.next(new Diary(diaryDto));
      this.focusedMeal = this.diarySubject$.value.latestMeal;
    } else {
      this.diarySubject$.next(undefined);
    }
  }

  public addPortion(portionDto: PortionAddDto): Observable<PortionDto> {
    return this.http.post<PortionDto>(
      `${this.baseUrl}${this.dateUrl}/add-portion`,
      portionDto
    );
  }

  public addPortions(portionDtos: PortionAddDto[]): Observable<PortionDto[]> {
    return this.http
      .post<{ portions: PortionDto[]; foods: FoodDto[] }>(
        `${this.baseUrl}${this.dateUrl}/portions`,
        portionDtos
      )
      .pipe(
        map(response => {
          // tk check for errors in the response? BadRequest()
          const newState =
            this.diarySubject$.getValue() === undefined
              ? new DiaryEntryDto()
              : { ...this.diarySubject$.getValue().dto };
          newState.portions.concat(response.portions);
          newState.foods.concat(response.foods);
          this.diarySubject$.next(new Diary(newState));
          return response.portions;
        })
      );
  }

  public changePortion(portionDto: PortionDto): Observable<PortionDto> {
    return this.http.put<PortionDto>(
      `${this.baseUrl}${this.dateUrl}/${portionDto.id}`,
      portionDto
    );
  }

  public removePortion(id: number): Observable<PortionDto> {
    return this.http.delete<PortionDto>(`${this.baseUrl}${this.dateUrl}/${id}`);
  }

  public unregisterHandlers(): void {
    this.hub.deregisterAll(this.constructor.name);
  }

  public deleteDiary(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.dateUrl}`);
  }

  public restoreDiary(dto: { portions: PortionDto[] }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}${this.dateUrl}`, dto);
  }
}
