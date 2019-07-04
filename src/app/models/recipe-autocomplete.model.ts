export interface RecipeDto {
  name: string;
  ingredients: { id: number; quantity: number }[];
}

export interface RecipeFoodDto {
  name: string;
  id: number;
}
