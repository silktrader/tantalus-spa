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
import { RecipeFoodDto } from '../models/recipe-autocomplete.model';
import { UiService } from './ui.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  constructor(private readonly http: HttpClient, private ui: UiService) { }
  private readonly url = environment.apiUrl + 'foods/';

  public addFood(food: FoodDto): Observable<FoodDto> {
    return this.http.post<FoodDto>(this.url, food, { withCredentials: true });
  }

  public editFood(food: FoodDto): Observable<unknown> {
    return this.http.put<unknown>(this.url + food.id, food, { withCredentials: true });
  }

  public deleteFood(id: string): Observable<unknown> {
    return this.http.delete<unknown>(this.url + id, { withCredentials: true });   // tk no need for credentials!! check
  }

  public getFood(foodUrl: string): Observable<Food | undefined> {
    return this.http.get<FoodDto>(this.url + foodUrl, { withCredentials: true }).pipe(
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
        return this.http.get<Array<PortionResource>>(`${this.url}filter?name=${text}`);
      }),
      debounceTime(300),
      distinctUntilChanged(),
    );
  }

  // tk check whether this belongs here
  public getAutocompleteFoods(filter: string): Observable<RecipeFoodDto[]> {
    return this.http
      .get<RecipeFoodDto[]>(`${this.url}autocomplete?filter=${filter}`)
      .pipe(tap(() => console.log('fetching ' + filter + ' ')));
  }
}

export interface PortionResource {
  id: string;
  name: string;
  isRecipe: boolean;
  priority: number;
}
