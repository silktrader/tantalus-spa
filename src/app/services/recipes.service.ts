import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RecipeGetResponse, RecipePostRequest } from '../models/recipe-autocomplete.model';
import { Observable } from 'rxjs';
import { RecipesPaginationDto } from '../models/recipes-pagination.model';
import { Recipe } from '../models/recipe.model';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private url = environment.apiUrl + 'recipes/';

  constructor(private readonly http: HttpClient) { }

  public saveRecipe(recipe: RecipePostRequest): Observable<RecipeGetResponse> {
    return this.http.post<RecipeGetResponse>(this.url, recipe);
  }

  public findRecipes(pageNumber: number, pageSize: number): Observable<RecipesPaginationDto> {
    return this.http.get<RecipesPaginationDto>(this.url, {
      params: new HttpParams()
        .set('pageIndex', pageNumber.toString())
        .set('pageSize', pageSize.toString())
        .set('sortProperty', 'name')
        .set('ascending', false)
    });
  }

  public findRecipe(id: string): Observable<Recipe> {
    return this.http
      .get<RecipeGetResponse>(this.url + id)
      .pipe(map(recipeDto => new Recipe(recipeDto)));
  }

  public editRecipe(recipe: RecipePostRequest): Observable<any> {
    return this.http.put<RecipeGetResponse>(this.url + recipe.id, recipe);
  }
}
