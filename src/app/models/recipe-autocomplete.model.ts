import { FoodDto } from './food-dto.model';

export interface RecipeDto {
  id: number;
  name: string;
  ingredients: Array<{ food: FoodDto; quantity: number }>;
}

export interface SaveRecipeDto {
  name: string;
  ingredients: Array<{ foodId: number; quantity: number }>;
}

export interface EditRecipeDto extends SaveRecipeDto {
  id: number;
}

export interface RecipeFoodDto {
  name: string;
  id: string;
}
