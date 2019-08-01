import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RecipeDto, SaveRecipeDto, EditRecipeDto } from '../models/recipe-autocomplete.model';
import { Observable } from 'rxjs';
import { RecipesPaginationDto } from '../models/recipes-pagination.model';
import { Recipe } from '../models/recipe.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private baseUrl = 'https://localhost:5001/api/recipes';

  constructor(private readonly http: HttpClient) {}

  public saveRecipe(recipeDto: SaveRecipeDto): Observable<RecipeDto> {
    return this.http.post<RecipeDto>(this.baseUrl, recipeDto);
  }

  public findRecipes(pageNumber: number, pageSize: number): Observable<RecipesPaginationDto> {
    return this.http.get<RecipesPaginationDto>(this.baseUrl, {
      params: new HttpParams()
        .set('pageIndex', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    });
  }

  public findRecipe(id: number): Observable<Recipe> {
    return this.http
      .get<RecipeDto>(`${this.baseUrl}/${id}`)
      .pipe(map(recipeDto => new Recipe(recipeDto)));
  }

  public editRecipe(id: number, recipeDto: EditRecipeDto): Observable<any> {
    return this.http.put<RecipeDto>(`${this.baseUrl}/${id}`, recipeDto);
  }
}
