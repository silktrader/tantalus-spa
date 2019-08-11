import { Food } from './food.model';

export class Portion {
  constructor(
    public readonly id: number,
    public quantity: number,
    public readonly food: Food,
    public meal: number
  ) {}

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

  public getTotalProperty(property: string): number {
    return (this.food[property] * this.quantity) / 100;
  }
}
