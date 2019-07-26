import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { Meal } from '../models/meal.model';
import { HttpClient } from '@angular/common/http';
import { PortionDto } from '../models/portion-dto.model';
import { DiaryEntryDto, DiaryEntryPostDto } from '../models/diary-entry-dto.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Diary } from '../models/diary.model';
import { PortionAddDto } from '../models/portion-add-dto.model';
import { FoodDto } from '../models/food-dto.model';

@Injectable()
export class DiaryService {
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

  constructor(private http: HttpClient, private route: ActivatedRoute) {
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
  }

  // should this be configurable by users? tk
  public get availableMealsIDs(): ReadonlyArray<number> {
    return Meal.numbers;
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

  /** Adds one portion and returns the server provided DTO; acts as a proxy of `addPortions` */
  public addPortion(portionDto: PortionAddDto): Observable<PortionDto> {
    return this.addPortions([portionDto]).pipe(map(dtos => dtos[0]));
  }

  /** Adds multiple portions when subscribed to and updates the diary with the new additions. */
  public addPortions(portionDtos: PortionAddDto[]): Observable<PortionDto[]> {
    return this.http
      .post<{ portions: PortionDto[]; foods: FoodDto[] }>(
        `${this.baseUrl}${this.dateUrl}/portions`,
        portionDtos
      )
      .pipe(
        map(response => {
          // tk check for errors in the response? BadRequest()
          const oldState =
            this.diarySubject$.getValue() === undefined
              ? new DiaryEntryDto()
              : { ...this.diarySubject$.getValue().dto };
          this.diarySubject$.next(
            new Diary({
              portions: [...oldState.portions, ...response.portions],
              foods: [...oldState.foods, ...response.foods]
            })
          );
          return response.portions;
        })
      );
  }

  public changePortion(portionDto: PortionDto): Observable<PortionDto> {
    return this.http
      .put<PortionDto>(`${this.baseUrl}${this.dateUrl}/${portionDto.id}`, portionDto)
      .pipe(
        map(response => {
          const newState = {
            ...this.diarySubject$.getValue().dto
          };
          // select the portion to be edited in the new state
          for (const portion of newState.portions) {
            if (portion.id === portionDto.id) {
              portion.meal = portionDto.meal;
              portion.quantity = portionDto.quantity;
            }
          }
          this.diarySubject$.next(new Diary(newState));
          return response;
        })
      );
  }

  public removePortion(id: number): Observable<{ id: number; foodId: number }> {
    return this.http
      .delete<{ id: number; foodId: number }>(`${this.baseUrl}${this.dateUrl}/${id}`)
      .pipe(
        map(ids => {
          const portions = [...this.diarySubject$.getValue().dto.portions];

          // check which portion to delete and marks foods to be deleted when unused by other portions
          let deleteFood = true;
          let deletedPortionIndex: number;
          for (let i = 0; i < portions.length; i++) {
            if (portions[i].id === ids.id) {
              deletedPortionIndex = i;
            } else if (portions[i].foodId === ids.foodId) {
              // the food's being referred to by another portions; don't mark it for deletion
              deleteFood = false;
            }
          }

          // delete portion
          portions.splice(deletedPortionIndex, 1);

          // delete food when necessary
          const foods = [...this.diarySubject$.getValue().dto.foods];
          if (deleteFood) {
            const deletedFoodIndex = foods.findIndex(food => food.id === ids.foodId);
            foods.splice(deletedFoodIndex, 1);
          }

          this.diarySubject$.next(new Diary({ portions, foods }));
          return ids;
        })
      );
  }

  public editComment(comment: string): Observable<string> {
    return this.http
      .post<{ comment: string }>(`${this.baseUrl}${this.dateUrl}/comment`, { comment })
      .pipe(
        map(response => {
          const previousState = this.diarySubject$.value
            ? { ...this.diarySubject$.value.dto }
            : { portions: [], foods: [] };
          this.diarySubject$.next(
            new Diary({
              comment: response.comment,
              portions: previousState.portions,
              foods: previousState.foods
            })
          );
          return response.comment;
        })
      );
  }

  public deleteDiary(): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}${this.dateUrl}`)
      .pipe(tap(() => this.diarySubject$.next(undefined)));
  }

  public restoreDiary(dto: DiaryEntryPostDto): Observable<DiaryEntryDto> {
    return this.http.post<DiaryEntryDto>(`${this.baseUrl}${this.dateUrl}`, dto).pipe(
      map(responseDto => {
        this.diarySubject$.next(new Diary(responseDto));
        return responseDto;
      })
    );
  }
}
