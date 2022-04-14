import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
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
  private baseUrl: string;

  private readonly diarySubject$ = new ReplaySubject<Diary>(1);
  public readonly diary$ = this.diarySubject$.asObservable();

  private readonly state$ = new ReplaySubject<DiaryEntryDto>(1);
  public state: Readonly<DiaryEntryDto>; // tk expose as readonly

  public focusedMeal = 0;

  // tslint:disable-next-line: variable-name
  private _date: Date;

  public get date(): Date {
    return this._date;
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
              this.setDate(DiaryService.parseUrl(params.date));
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
      this.state = state;
      if (state) {
        const diary = this.mapper.mapDiary(state);
        this.diarySubject$.next(diary);
        // tk rename getLatestMeal()?
        this.focusedMeal = diary.latestMeal;
      } else {
        // tk handle this better
        this.diarySubject$.next(undefined);
        this.focusedMeal = 0;
      }
    });
  }

  public static toDateUrl(date: Date): string {
    return `${date.getFullYear()}-${DiaryService.padDate(
      date.getMonth() + 1
    )}-${DiaryService.padDate(date.getDate())}`;
  }

  private static padDate(monthOrDay: number) {
    return monthOrDay < 10 ? '0' + monthOrDay : monthOrDay;
  }

  /**
   * Native date parsing is chaotic and likely to be tied to browsers implementations
   */
  public static parseUrl(urlString: string): Date {
    const dateParts = urlString.split('-').map(Number);
    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  }

  private setDate(date: Date) {
    this._date = date;
    this.baseUrl = environment.baseUrl + 'diary/' + DiaryService.toDateUrl(date);
  }

  private getDiaryData(): Observable<DiaryEntryDto> {
    return this.http.get<DiaryEntryDto>(this.baseUrl);
  }

  /** Adds one portion and returns the server provided DTO; acts as a proxy of `addPortions` */
  public addPortion(portionDto: PortionAddDto): Observable<PortionDto> {
    return this.addPortions([portionDto]).pipe(map(dtos => dtos[0]));
  }

  /** Remove duplicate food DTOs to avoid the diary state growing in size */
  private removeDuplicateFoods(portions: PortionDto[], foods: FoodDto[]): FoodDto[] {
    // tk might be slow
    const foodsMap = new Map(foods.map(food => [food.id, food] as [string, FoodDto]));
    const addedFoodsIds = new Set<string>();
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
      .post<{ portions: PortionDto[]; foods: FoodDto[] }>(this.baseUrl + '/portions', portionDtos)
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
    return this.http.put<PortionDto>(this.baseUrl + '/portions/' + dto.id, dto).pipe(
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

    return this.http.delete<void>(this.baseUrl + '/portions', { params }).pipe(
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
    return this.http.post<{ comment: string }>(this.baseUrl + ' /comment', { comment }).pipe(
      map(response => {
        // update the state with the latest comments, or add an empty state when required
        this.state$.next({
          ...(this.state || { portions: [], foods: [] }),
          comment: response.comment
        });

        return response.comment;
      })
    );
  }

  public deleteDiary(): Observable<void> {
    return this.http.delete<void>(this.baseUrl).pipe(tap(() => this.state$.next(undefined)));
  }

  public restoreDiary(dto: DiaryEntryPostDto): Observable<DiaryEntryDto> {
    return this.http.post<DiaryEntryDto>(this.baseUrl, dto).pipe(
      map(responseDto => {
        this.state$.next(responseDto);
        return responseDto;
      })
    );
  }
}
