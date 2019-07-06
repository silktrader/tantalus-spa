import { FoodDto } from './food-dto.model';

export interface RecipeDto {
  name: string;
  ingredients: { food: FoodDto; quantity: number }[];
}

export interface RecipeFoodDto {
  name: string;
  id: number;
}
