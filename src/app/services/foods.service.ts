import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Food } from '../models/food.model';
import { FoodDto } from '../models/food-dto.model';
import * as signalR from '@aspnet/signalr';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private baseUrl = 'https://localhost:5001/api/foods';

  private readonly foods$ = new BehaviorSubject<Food[]>([]);
  public foods = this.foods$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthenticationService
  ) {
    // populate the initial foods store
    // this.http
    //   .get(this.baseUrl)
    //   .pipe(shareReplay(1))
    //   .subscribe(
    //     (response: FoodDto[]) => {
    //       this.foods$.next(response.map(item => this.createFood(item)));
    //     },
    //     error => {
    //       console.log(error);
    //     }
    //   );

    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(`https://localhost:5001/foodshub`, {
        accessTokenFactory: () => this.auth.currentUserValue.token
      })
      .build();

    connection
      .start()
      .then(() => {
        console.log('Connected!');
      })
      .catch(err => {
        return console.error(err.toString());
      });

    connection.on('FoodAdd', food => {
      this.foods$.next([...this.foods$.getValue(), this.createFood(food)]);
      console.log(food);
    });

    connection.on('FoodRemove', (food: FoodDto) => {
      this.foods$.next(
        this.foods$.getValue().filter(item => item.id !== food.id)
      );
    });

    connection.on('FoodEdit', (food: FoodDto) => {
      const foods = this.foods$.getValue();
      const index = foods.findIndex(item => item.id === food.id);
      foods[index] = this.createFood(food);
      this.foods$.next(foods);
    });
  }

  private createFood(data: FoodDto): Food {
    return new Food(data);
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
}
