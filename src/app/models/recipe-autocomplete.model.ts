import { FoodDto } from './food-dto.model';

export interface RecipeGetResponse {
  id: string;
  name: string;
  ingredients: Array<{ food: FoodDto; quantity: number }>;
}

export interface RecipePostRequest {
  id: string;
  name: string;
  ingredients: Array<{ foodId: string; quantity: number }>;
}

export interface RecipeFoodDto {
  name: string;
  id: string;
}
