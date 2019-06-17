import { Food } from './food.model';
import { PortionDto } from './portion-dto-model';

export class Portion implements PortionDto {
  constructor(
    public id: number,
    public Quantity: number,
    public food: Food,
    public MealNumber: number
  ) {}

  get FoodId(): number {
    return this.food.id;
  }

  get proteins(): number {
    return (this.food.proteins * this.Quantity) / 100;
  }

  get carbs(): number {
    return (this.food.carbs * this.Quantity) / 100;
  }

  get fats(): number {
    return (this.food.fats * this.Quantity) / 100;
  }

  get calories(): number {
    return (this.food.calories * this.Quantity) / 100;
  }

  get serialised(): PortionDto {
    return {
      id: this.id,
      Quantity: this.Quantity,
      FoodId: this.FoodId,
      MealNumber: this.MealNumber
    };
  }
}
