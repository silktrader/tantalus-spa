import { RecipeGetResponse } from './recipe-autocomplete.model';

export interface RecipesPaginationDto {
  recipes: RecipeGetResponse[];
  count: number;
}
