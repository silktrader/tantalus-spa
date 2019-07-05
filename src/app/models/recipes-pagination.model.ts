import { RecipeDto } from './recipe-autocomplete.model';

export interface RecipesPaginationDto {
  recipes: RecipeDto[];
  recipesCount: number;
}
