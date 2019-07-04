export interface RecipeDto {
  name: string;
  ingredients: { foodId: number; quantity: number }[];
}

export interface RecipeFoodDto {
  name: string;
  id: number;
}
