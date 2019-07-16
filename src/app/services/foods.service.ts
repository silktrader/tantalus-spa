import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  map,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Food } from '../models/food.model';
import { FoodDto } from '../models/food-dto.model';
import { RecipeFoodDto, RecipeDto } from '../models/recipe-autocomplete.model';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private baseUrl = 'https://localhost:5001/api/foods';

  private readonly foods$ = new BehaviorSubject<Food[]>([]);
  public readonly foods = this.foods$.asObservable();

  constructor(private readonly http: HttpClient) {
    // populate the initial foods store
    this.http.get(this.baseUrl).subscribe(
      (foods: FoodDto[]) => {
        this.foods$.next(foods.map(dto => new Food(dto)));
      },
      error => console.log(error)
    );
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

  public getFood(id: number): Promise<Food> {
    return this.http
      .get<FoodDto>(`${this.baseUrl}/${id}`)
      .pipe(map((data: FoodDto) => new Food(data)))
      .toPromise();
  }

  public getRecipe(id: number): Observable<Recipe> {
    return this.http
      .get<RecipeDto>(`${this.baseUrl}/recipes/${id}`)
      .pipe(map(dto => new Recipe(dto)));
  }

  public getFilteredFoods(
    filter: BehaviorSubject<string>
  ): Observable<Array<Food | Recipe>> {
    return filter.pipe(
      switchMap(filterText => {
        const text = filterText.toLowerCase();
        return this.http.get<Array<FoodDto | RecipeDto>>(
          `${this.baseUrl}/filter?name=${text}`
        );
      }),
      debounceTime(300),
      distinctUntilChanged(),
      map(data => {
        const portions: Array<Food | Recipe> = [];
        for (const dto of data) {
          if (this.isRecipe(dto)) {
            portions.push(new Recipe(dto));
          } else {
            portions.push(new Food(dto));
          }
        }
        return portions;
      })
    );
  }

  public isRecipe(portion: FoodDto | RecipeDto): portion is RecipeDto {
    return (portion as RecipeDto).ingredients !== undefined;
  }

  public getAutocompleteFoods(filter: string): Observable<RecipeFoodDto[]> {
    return this.http
      .get<RecipeFoodDto[]>(`${this.baseUrl}/autocomplete?filter=${filter}`)
      .pipe(tap(value => console.log('fetching ' + filter + ' ')));
  }
}
