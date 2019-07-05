import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RecipeDto } from '../models/recipe-autocomplete.model';
import { Observable } from 'rxjs';
import { RecipesPaginationDto } from '../models/recipes-pagination.model';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private baseUrl = 'https://localhost:5001/api/recipes';

  constructor(private readonly http: HttpClient) {}

  public saveRecipe(recipeDto: RecipeDto): Observable<RecipeDto> {
    return this.http.post<RecipeDto>(this.baseUrl, recipeDto);
  }

  public findRecipes(
    pageNumber = 0,
    pageSize = 10
  ): Observable<RecipesPaginationDto> {
    return this.http.get<RecipesPaginationDto>(this.baseUrl, {
      params: new HttpParams()
        .set('pageIndex', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    });
  }
}
