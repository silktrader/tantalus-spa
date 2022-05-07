import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Food } from '../models/food.model';
import { FoodDto } from '../models/food-dto.model';
import { UiService } from './ui.service';
import { environment } from 'src/environments/environment';
import { FoodProp } from '../models/food-prop.model';
import { Meal } from '../models/portion.model';

@Injectable({ providedIn: 'root' })
export class FoodsService {

  constructor(private readonly http: HttpClient, private ui: UiService) { }

  // the AI/PRI values derived from the EFSA tables at https://multimedia.efsa.europa.eu/drvs/index.htm
  // values are in mg
  private adultMaleDRV: Map<FoodProp, number> = new Map([
    [FoodProp.calcium, 950],
    [FoodProp.magnesium, 350],
    [FoodProp.iron, 11],
    [FoodProp.potassium, 3500],
    [FoodProp.sodium, 2000],
    [FoodProp.zinc, 11],
  ]);

  private readonly url = environment.apiUrl + 'foods/';

  public addFood(food: FoodDto): Observable<FoodDto> {
    return this.http.post<FoodDto>(this.url, food);
  }

  public editFood(food: FoodDto): Observable<unknown> {
    return this.http.put<unknown>(this.url + food.id, food);
  }

  public deleteFood(id: string): Observable<unknown> {
    return this.http.delete<unknown>(this.url + id);   // tk no need for credentials!! check
  }

  public getFood(foodUrl: string): Observable<Food | undefined> {
    return this.http.get<FoodDto>(this.url + foodUrl).pipe(
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
    ascending: boolean,
    nameFilter: string
  ): Observable<{ foods: FoodDto[]; count: number }> {
    // draft a list of parameters
    let params = new HttpParams()
      .set('pageIndex', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('sortProperty', sortProperty)
      .set('ascending', ascending);

    if (nameFilter) params = params.set('nameFilter', nameFilter);

    return this.http.get<{ foods: FoodDto[]; count: number }>(this.url, { params }).pipe(
      catchError(error => {
        this.ui.warn("Error while loading foods");
        console.error(error);
        return of({ foods: [], count: 0 });
      })
    );
  }

  public getFilteredFoods(filter: Observable<string>): Observable<Array<PortionResource>> {
    return filter.pipe(
      switchMap(filterText => {
        const text = filterText.toLowerCase();
        return this.http.get<Array<PortionResource>>(`${this.url}names?filter=${text}`);
      }),
      debounceTime(300),
      distinctUntilChanged(),
    );
  }

  // tk check whether this belongs here
  public getAutocompleteFoods(filter: string): Observable<ReadonlyArray<PortionResource>> {
    return this.isString(filter) ? this.http.get<Array<PortionResource>>(`${this.url}names?filter=${filter.toLowerCase()}`) : of([]);
  }

  private isString(data: unknown): data is string {
    return typeof data === 'string';
  }

  public foodStats(foodId: string) {
    return this.http.get<GetFoodStatsResponse>(`${this.url + foodId}/stats`);
  }

  /** Returns the Dietary Reference Values (DRV) for selected food properties, for males (at present) */
  public getDRV(property: FoodProp, value: number): number {
    const referenceValue = this.adultMaleDRV.get(property);
    return (referenceValue === undefined || referenceValue === 0) ? 1 : (value / referenceValue);
  }
}

export interface GetFoodStatsResponse {
  count: number;
  quantity: number;
  max: number;
  lastEaten: Date | null;
  frequentFoods: FrequentFood[];
  frequentMeals: FrequentMeal[];
  recipes: RecipeFoodStat[];
}

export interface FrequentFood {
  id: string;
  name: string;
  shortUrl: string;
  frequency: number;
}

export interface FrequentMeal {
  frequency: number;
  meal: Meal;
}

export interface RecipeFoodStat {
  id: string;
  name: string;
  quantity: number;
}

export interface PortionResource {
  id: string;
  name: string;
  isRecipe: boolean;
  priority: number;
}


