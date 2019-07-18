import { Portion } from './portion.model';

export class Meal {
  public static mealNames: ReadonlyArray<string> = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks'
  ];

  public static numbers: ReadonlyArray<number> = Array.from(
    Meal.mealNames.keys()
  );

  constructor(
    public readonly order: number,
    private readonly portions: Portion[]
  ) {}

  get Portions(): ReadonlyArray<Portion> {
    return this.portions;
  }

  public get name(): string {
    return Meal.getName(this.order);
  }

  public static getName(order: number): string {
    return this.mealNames[order];
  }

  public getTotalProperty(propertyName: string): number {
    let total = 0;
    for (const portion of this.portions) {
      total += (portion.food[propertyName] * portion.quantity) / 100;
    }
    return total;
  }
}
