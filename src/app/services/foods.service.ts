import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  map,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  shareReplay,
  tap
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Food } from '../models/food.model';
import { FoodDto } from '../models/food-dto.model';
import { HubService } from './hub.service';
import { RecipeFoodDto, RecipeDto } from '../models/recipe-autocomplete.model';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private baseUrl = 'https://localhost:5001/api/foods';

  private readonly foods$ = new BehaviorSubject<Food[]>([]);
  public readonly foods = this.foods$.asObservable();

  constructor(private readonly http: HttpClient, private hub: HubService) {
    // populate the initial foods store
    this.http.get(this.baseUrl).subscribe(
      (foods: FoodDto[]) => {
        this.foods$.next(foods.map(dto => new Food(dto)));
      },
      error => console.log(error)
    );

    this.hub.register(this.constructor.name, 'FoodAdd', foodDto => {
      this.foods$.next([...this.foods$.getValue(), new Food(foodDto)]);
    });

    this.hub.register(this.constructor.name, 'FoodRemove', (food: FoodDto) => {
      this.foods$.next(
        this.foods$.getValue().filter(item => item.id !== food.id)
      );
    });

    this.hub.register(this.constructor.name, 'FoodEdit', (foodDto: FoodDto) => {
      const foods = this.foods$.getValue();
      const index = foods.findIndex(item => item.id === foodDto.id);
      foods[index] = new Food(foodDto);
      this.foods$.next(foods);
    });
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
