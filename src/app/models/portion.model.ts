import { Food } from './food.model';

export enum Meal {
  Breakfast = 'Breakfast',
  Morning = 'Morning',
  Lunch = 'Lunch',
  Afternoon = 'Afternoon',
  Dinner = 'Dinner'
}

export const PossibleMeals = Object.values(Meal);

export class Portion {
  constructor(
    public readonly id: string,
    public quantity: number,
    public readonly food: Food,
    public meal: Meal
  ) { }

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

  get alcohol(): number {
    return (this.food.alcohol * this.quantity) / 100;
  }

  public getTotalProperty(property: string): number {
    return (this.food[property] * this.quantity) / 100;
  }
}
