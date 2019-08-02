import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  map,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  tap,
  catchError
} from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Food } from '../models/food.model';
import { FoodDto } from '../models/food-dto.model';
import { RecipeFoodDto, RecipeDto } from '../models/recipe-autocomplete.model';
import { Recipe } from '../models/recipe.model';
import { UiService } from './ui.service';
import { FoodProp } from '../models/food-prop.model';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  constructor(private readonly http: HttpClient, private ui: UiService) {}
  private baseUrl = 'https://localhost:5001/api/foods';

  public static isRecipeDto(dto: any): dto is RecipeDto {
    return (dto as RecipeDto).ingredients !== undefined;
  }

  // tk not very solid since source is nullable
  public static isFoodDto(dto: any): dto is FoodDto {
    return (dto as FoodDto).source !== undefined;
  }

  public addFood(food: FoodDto): Observable<FoodDto> {
    return this.http.post<FoodDto>(`${this.baseUrl}`, food);
  }

  public editFood(food: FoodDto): Observable<FoodDto> {
    return this.http.put<FoodDto>(`${this.baseUrl}/${food.id}`, food);
  }

  public deleteFood(id: number): Observable<FoodDto> {
    return this.http.delete<FoodDto>(`${this.baseUrl}/${id}`);
  }

  public getFood(id: number): Observable<Food | undefined> {
    return this.http.get<FoodDto>(`${this.baseUrl}/${id}`).pipe(
      map(data => new Food(data)),
      catchError(error => {
        this.ui.warn(error);
        return of(undefined);
      })
    );
  }

  public getPaginatedFoods(
    pageNumber: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'asc' | 'desc'
  ): Observable<{ foods: FoodDto[]; count: number }> {
    return this.http
      .get<{ foods: FoodDto[]; count: number }>(this.baseUrl, {
        params: new HttpParams()
          .set('pageIndex', pageNumber.toString())
          .set('pageSize', pageSize.toString())
          .set('sortProperty', sortProperty)
          .set('sortOrder', sortOrder)
      })
      .pipe(
        catchError(error => {
          this.ui.warn(error);
          return of({ foods: [], count: 0 });
        })
      );
  }

  public getFilteredFoods(filter: Observable<string>): Observable<Array<Food | Recipe>> {
    return filter.pipe(
      switchMap(filterText => {
        const text = filterText.toLowerCase();
        return this.http.get<Array<FoodDto | RecipeDto>>(`${this.baseUrl}/filter?name=${text}`);
      }),
      debounceTime(300),
      distinctUntilChanged(),
      map(data => {
        const portions: Array<Food | Recipe> = [];
        for (const dto of data) {
          if (FoodsService.isRecipeDto(dto)) {
            portions.push(new Recipe(dto));
          } else if (FoodsService.isFoodDto(dto)) {
            portions.push(new Food(dto));
          }
        }
        return portions;
      })
    );
  }

  // tk check whether this belongs here
  public getAutocompleteFoods(filter: string): Observable<RecipeFoodDto[]> {
    return this.http
      .get<RecipeFoodDto[]>(`${this.baseUrl}/autocomplete?filter=${filter}`)
      .pipe(tap(value => console.log('fetching ' + filter + ' ')));
  }
}
