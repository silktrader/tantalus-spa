import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeDto } from '../models/recipe-autocomplete.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private baseUrl = 'https://localhost:5001/api/recipes';

  constructor(private readonly http: HttpClient) {}

  public saveRecipe(recipeDto: RecipeDto): Observable<RecipeDto> {
    return this.http.post<RecipeDto>(`${this.baseUrl}`, recipeDto);
  }
}
