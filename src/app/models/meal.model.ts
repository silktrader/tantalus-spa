import { Portion } from './portion.model';

export class Meal {
  public static mealNames: ReadonlyArray<string> = [
    'Breakfast',
    'Morning',
    'Lunch',
    'Afternoon',
    'Dinner',
    'Snacks'
  ];

  public static mealIDs: ReadonlyArray<number> = Array.from(
    Meal.mealNames.keys()
  );

  constructor(public readonly order: number) {}

  get portions(): ReadonlyArray<Portion> {
    return this._portions;
  }

  private _portions: Portion[] = [];

  public get name(): string {
    return Meal.getName(this.order);
  }

  public static getName(order: number): string {
    return this.mealNames[order];
  }

  // tk handle duplicate portions with same id?
  public addPortion(portion: Portion) {
    this._portions.push(portion);
  }

  private getTotalMacronutrient(macro: string) {
    let total = 0;
    for (let i = 0; i < this._portions.length; i++) {
      total +=
        (this._portions[i].food[macro] * this._portions[i].Quantity) / 100;
    }
    return total;
  }

  public get calories(): number {
    return this.getTotalMacronutrient('calories');
  }

  public get proteins(): number {
    return this.getTotalMacronutrient('proteins');
  }

  public get carbs(): number {
    return this.getTotalMacronutrient('carbs');
  }

  public get fats(): number {
    return this.getTotalMacronutrient('fats');
  }
}
