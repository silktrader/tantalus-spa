import { Meal } from './meal.model';
import { Portion } from './portion.model';

export class Diary {
  private mealsMap: Map<number, Meal> = new Map<number, Meal>();
  public get meals(): ReadonlyArray<Meal> {
    return Array.from(this.mealsMap.values()); // TK slow
  }

  constructor(portions: Portion[], public readonly comment?: string) {
    // create portions and slot them in the cached meals map
    const meals = new Map<number, Array<Portion>>();
    for (const portion of portions) {
      const meal = meals.get(portion.meal);
      if (meal === undefined) {
        meals.set(portion.meal, [portion]);
      } else {
        meal.push(portion);
      }
    }

    // set the final map by creating immutable meals
    for (const kvp of meals) {
      this.mealsMap.set(kvp[0], new Meal(kvp[0], kvp[1]));
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
