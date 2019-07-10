import { Food } from './food.model';

export interface Ingredient {
  readonly food: Food;
  quantity: number;
}
