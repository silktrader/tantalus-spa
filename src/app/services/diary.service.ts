import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PortionDto } from '../models/portion-dto.model';
import { DiaryEntryDto, DiaryEntryPostDto } from '../models/diary-entry-dto.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Diary } from '../models/diary.model';
import { PortionAddDto } from '../models/portion-add-dto.model';
import { FoodDto } from '../models/food-dto.model';
import { environment } from 'src/environments/environment';
import { DtoMapper } from './dto-mapper';

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

  constructor(private http: HttpClient, private route: ActivatedRoute, private mapper: DtoMapper) {
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
      .subscribe(diaryDto => {
        // the state expects either a value or undefined, not null
        diaryDto = diaryDto || undefined;
        this.state$.next(diaryDto);
      });

    // any time a new state is acquired a new diary is created
    this.state$.subscribe(state => {
      if (state) {
        this.diarySubject$.next(this.mapper.mapDiary(state));
        this.focusedMeal = this.diarySubject$.value.latestMeal;
      } else {
        this.diarySubject$.next(undefined);
        this.focusedMeal = 0;
      }
    });
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
          // the first portions of a new diary don't need to be added to a previous state
          if (this.state === undefined) {
            this.state$.next({ portions: response.portions, foods: response.foods });
            return response.portions;
          }

          const portions = [...this.state.portions, ...response.portions];
          this.state$.next({
            ...this.state,
            portions,
            foods: this.removeDuplicateFoods(portions, [...this.state.foods, ...response.foods])
          });

          return response.portions;
        })
      );
  }

  public changePortion(dto: PortionDto): Observable<PortionDto> {
    return this.http.put<PortionDto>(`${this.url}${this.dateUrl}/${dto.id}`, dto).pipe(
      map(responseDto => {
        // create a new portion array and substitute the relevant entry
        const portions = this.state.portions.map(portion =>
          portion.id === responseDto.id ? responseDto : portion
        );

        this.state$.next({ ...this.state, portions });
        return responseDto;
      })
    );
  }

  public removePortions(ids: Array<number>): Observable<void> {
    // build the parameters list
    let params = new HttpParams();
    for (const id of ids) {
      params = params.append('ids', id.toString());
    }

    return this.http.delete<void>(this.url + 'portions', { params }).pipe(
      tap(() => {
        const portions = this.state.portions.filter(portion => !ids.includes(portion.id));
        this.state$.next({ ...this.state, portions });
      })
    );
  }

  public removePortion(id: number): Observable<void> {
    return this.removePortions([id]);
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
      .pipe(tap(() => this.state$.next(undefined)));
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
