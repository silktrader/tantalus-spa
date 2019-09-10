import { Portion } from './portion.model';

export class Diary {
  public static mealTypes = new Map<number, string>([
    [0, 'Breakfast'],
    [1, 'Lunch'],
    [2, 'Snacks'],
    [3, 'Dinner']
  ]);

  // tk lock up
  public readonly meals: ReadonlyMap<number, ReadonlyArray<Portion>>;

  public readonly proteins = 0;
  public readonly carbs = 0;
  public readonly fats = 0;
  public readonly calories = 0;

  constructor(portions: Portion[], public readonly comment?: string) {
    // create an ordered map from the available meals
    const orderedMeals = new Map<number, Array<Portion>>();
    for (const mealIndex of Diary.mealTypes.keys()) {
      orderedMeals.set(mealIndex, []);
    }

    // slot portions in the ordered map
    for (const portion of portions) {
      orderedMeals.get(portion.meal).push(portion);

      // assign aggregates to avoid multiple iterations
      this.proteins += portion.proteins;
      this.carbs += portion.carbs;
      this.fats += portion.fats;
      this.calories += portion.calories;
    }

    // assign the cached map to a readonly collection
    this.meals = orderedMeals;
  }

  public getTotalProperty(propertyName: string) {
    let total = 0;
    for (const meal of this.meals.values()) {
      for (const portion of meal) {
        total += portion.getTotalProperty(propertyName);
      }
    }
    return total;
  }

  public get latestMeal(): number {
    let latestMeal = 0;
    for (const kvp of this.meals) {
      if (kvp[1].length > 0 && kvp[0] > latestMeal) {
        latestMeal = kvp[0];
      }
    }
    return latestMeal;
  }

  public get hasContents(): boolean {
    for (const meal of this.meals.values()) {
      if (meal.length > 0) {
        return true;
      }
    }
    return false;
  }

  public getMealName(meal: number): string {
    return Diary.mealTypes.get(meal);
  }

  public getMealProperty(meal: number, property: string): number {
    const portions = this.meals.get(meal);
    let total = 0;
    for (const portion of portions) {
      total += portion.getTotalProperty(property);
    }
    return total;
  }

  public getMealCaloriesPercentage(meal: number): number {
    let mealCalories = 0;
    for (const portion of this.meals.get(meal)) {
      mealCalories += portion.calories;
    }
    return mealCalories / this.calories;
  }

  public recordedMeals(mealNumber: number): number {
    const meal = this.meals.get(mealNumber);
    if (meal === undefined) {
      return 0;
    }
    return meal.length;
  }

  public getPortion(id: number): Portion | undefined {
    for (const meal of this.meals.values()) {
      for (const portion of meal) {
        if (portion.id === id) {
          return portion;
        }
      }
    }

    return undefined;
  }
}
