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
import { environment } from 'src/environments/environment';
import { DiaryAdapter } from './diary-adapter';

@Injectable()
export class DiaryService {
  private readonly url = environment.baseUrl + 'diary/';

  private readonly diarySubject$ = new BehaviorSubject<Diary>(undefined);
  public readonly diary$ = this.diarySubject$.asObservable();

  private readonly state$ = new BehaviorSubject<DiaryEntryDto>(undefined);

  public get state(): Readonly<DiaryEntryDto> {
    return this.state$.getValue();
  }

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
    private diaryAdapter: DiaryAdapter
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
      .subscribe(diaryDto => this.state$.next(diaryDto));

    // any time a new state is acquired a new diary is created
    this.state$.subscribe(state => {
      if (state) {
        this.diarySubject$.next(this.diaryAdapter.toModel(state));
        this.focusedMeal = this.diarySubject$.value.latestMeal;
      } else {
        this.diarySubject$.next(undefined);
        this.focusedMeal = 0;
      }
    });
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
    return this.http.get<DiaryEntryDto>(`${this.url}${this.dateUrl}`);
  }

  /** Adds one portion and returns the server provided DTO; acts as a proxy of `addPortions` */
  public addPortion(portionDto: PortionAddDto): Observable<PortionDto> {
    return this.addPortions([portionDto]).pipe(map(dtos => dtos[0]));
  }

  /** Remove duplicate food DTOs to avoid the diary state growing in size */
  private removeDuplicateFoods(portions: PortionDto[], foods: FoodDto[]): FoodDto[] {
    // tk might be slow
    const foodsMap = new Map(foods.map(food => [food.id, food] as [number, FoodDto]));
    const addedFoodsIds = new Set<number>();
    const foodsDtos = [];

    for (const portion of portions) {
      if (!addedFoodsIds.has(portion.foodId)) {
        foodsDtos.push(foodsMap.get(portion.foodId));
        addedFoodsIds.add(portion.foodId);
      }
    }

    return foodsDtos;
  }

  /** Adds multiple portions when subscribed to and updates the diary with the new additions. */
  public addPortions(portionDtos: PortionAddDto[]): Observable<PortionDto[]> {
    return this.http
      .post<{ portions: PortionDto[]; foods: FoodDto[] }>(
        `${this.url}${this.dateUrl}/portions`,
        portionDtos
      )
      .pipe(
        map(response => {
          const state = this.state$.getValue();

          // the first portions of a new diary don't need to be added to a previous state
          if (state === undefined) {
            this.state$.next({ portions: response.portions, foods: response.foods });
            return response.portions;
          }

          const portions = [...state.portions, ...response.portions];
          this.state$.next({
            ...state,
            portions,
            foods: this.removeDuplicateFoods(portions, [...state.foods, ...response.foods])
          });

          return response.portions;
        })
      );
  }

  public changePortion(portionDto: PortionDto): Observable<PortionDto> {
    return this.http
      .put<PortionDto>(`${this.url}${this.dateUrl}/${portionDto.id}`, portionDto)
      .pipe(
        map(response => {
          const newState = {
            ...this.state$.getValue()
          };
          // select the portion to be edited in the new state
          for (const portion of newState.portions) {
            if (portion.id === portionDto.id) {
              portion.meal = portionDto.meal;
              portion.quantity = portionDto.quantity;
            }
          }
          this.state$.next(newState);
          return response;
        })
      );
  }

  public removePortion(id: number): Observable<{ id: number; foodId: number }> {
    return this.http
      .delete<{ id: number; foodId: number }>(`${this.url}${this.dateUrl}/${id}`)
      .pipe(
        map(ids => {
          const portions = [...this.state$.getValue().portions];

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

          // delete food when necessary or copy the previous ones
          const foods = [...this.state$.getValue().foods];
          if (deleteFood) {
            const deletedFoodIndex = foods.findIndex(food => food.id === ids.foodId);
            foods.splice(deletedFoodIndex, 1);
          }

          this.state$.next({ ...this.state$.getValue(), portions, foods });
          return ids;
        })
      );
  }

  public editComment(comment: string): Observable<string> {
    return this.http
      .post<{ comment: string }>(`${this.url}${this.dateUrl}/comment`, { comment })
      .pipe(
        map(response => {
          // update the state with the latest comments, or add an empty state when required
          this.state$.next({
            ...(this.state$.value || { portions: [], foods: [] }),
            comment: response.comment
          });

          return response.comment;
        })
      );
  }

  public deleteDiary(): Observable<void> {
    return this.http
      .delete<void>(`${this.url}${this.dateUrl}`)
      .pipe(tap(() => this.diarySubject$.next(undefined)));
  }

  public restoreDiary(dto: DiaryEntryPostDto): Observable<DiaryEntryDto> {
    return this.http.post<DiaryEntryDto>(`${this.url}${this.dateUrl}`, dto).pipe(
      map(responseDto => {
        this.state$.next(responseDto);
        return responseDto;
      })
    );
  }
}
