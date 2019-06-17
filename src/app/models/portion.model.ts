import { Food } from './food.model';
import { PortionDto } from './portion-dto-model';

export class Portion implements PortionDto {
  constructor(
    public id: number,
    public quantity: number,
    public food: Food,
    public mealNumber: number
  ) {}

  get foodId(): number {
    return this.food.id;
  }

  get proteins(): number {
    return (this.food.proteins * this.quantity) / 100;
  }

  get carbs(): number {
    return (this.food.carbs * this.quantity) / 100;
  }

  get fats(): number {
    return (this.food.fats * this.quantity) / 100;
  }

  get calories(): number {
    return (this.food.calories * this.quantity) / 100;
  }
}
