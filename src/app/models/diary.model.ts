import { Meal } from './meal.model';
import { Portion } from './portion.model';

export class Diary {
  public readonly comment: Readonly<string>;

  private mealsMap: Map<number, Meal> = new Map<number, Meal>();
  public get meals(): ReadonlyArray<Meal> {
    return Array.from(this.mealsMap.values()); // TK slow
  }

  constructor(portions: Portion[], comment?: string) {
    this.comment = comment;

    // create a collection that will hosts portions according to their ordered meal number
    // tk can be improved with spread operator over static field?
    const meals = new Map<number, Array<Portion>>();
    for (const mealNumber of Meal.numbers) {
      meals.set(mealNumber, []);
    }

    // create portions and slot them in the cached meals map
    for (const portion of portions) {
      meals.get(portion.meal).push(portion);
    }

    // set the final meals map
    for (const mealKvp of meals) {
      if (mealKvp[1].length === 0) {
        continue;
      }
      this.mealsMap.set(mealKvp[0], new Meal(mealKvp[0], mealKvp[1]));
    }
  }

  public getTotalProperty(propertyName: string) {
    let total = 0;
    this.mealsMap.forEach(meal => (total += meal.getTotalProperty(propertyName)));
    return total;
  }

  public get latestMeal(): number {
    let latestMeal = 0;
    for (const meal of this.mealsMap.values()) {
      if (meal.order > latestMeal) {
        latestMeal = meal.order;
      }
    }
    return latestMeal;
  }

  public get hasContents(): boolean {
    for (const meal of this.mealsMap.values()) {
      if (meal.Portions.length > 0) {
        return true;
      }
    }
    return false;
  }

  /** Which meals can be recorded [0-5] */
  public get availableMeals(): ReadonlyArray<number> {
    return Meal.numbers;
  }

  public getMealName(mealNumber: number): string {
    return Meal.mealNames[mealNumber];
  }

  public recordedMeals(mealNumber: number): number {
    const meal = this.mealsMap.get(mealNumber);
    if (meal === undefined) {
      return 0;
    }
    return meal.Portions.length;
  }

  public getPortion(id: number): Portion | undefined {
    for (const meal of this.mealsMap.values()) {
      for (const portion of meal.Portions) {
        if (portion.id === id) {
          return portion;
        }
      }
    }

    return undefined;
  }
}
