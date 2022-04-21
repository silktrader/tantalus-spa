import { Meal } from "./portion.model";

export interface PortionDto {
  readonly id: string;
  readonly meal: Meal;
  readonly foodId: string;
  readonly quantity: number;
}
