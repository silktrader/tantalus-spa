import { Meal } from "./portion.model";

export interface PortionAddDto {
  meal: Meal;
  foodId: string;
  quantity: number;
}
