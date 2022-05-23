import { DiaryEntryDto, WeightReport } from './diary-entry-dto.model';
import { Meal, Portion } from './portion.model';

export class Diary {

  public readonly meals: ReadonlyMap<string, ReadonlyArray<Portion>>;

  public readonly proteins = 0;
  public readonly carbs = 0;
  public readonly fats = 0;
  public readonly calories = 0;

  readonly mood: number;
  readonly fitness: number;
  readonly comment?: string;

  readonly weightReport: WeightReport;

  private static orderedMeals = [Meal.Breakfast, Meal.Morning, Meal.Lunch, Meal.Afternoon, Meal.Dinner].map(meal => meal.toString());

  constructor(portions: Portion[], data: DiaryEntryDto) {
    const meals = new Map<Meal, Array<Portion>>();

    // slot portions in the ordered map
    for (const portion of portions) {
      const existingMeal = meals.get(portion.meal);
      if (existingMeal) {
        existingMeal.push(portion);
      } else {
        meals.set(portion.meal, [portion]);
      }

      // assign aggregates to avoid multiple iterations
      this.proteins += portion.proteins;
      this.carbs += portion.carbs;
      this.fats += portion.fats;
      this.calories += portion.calories;
    }

    // assign the cached map to a readonly collection
    this.meals = meals;

    this.mood = data.mood;
    this.fitness = data.fitness;

    this.weightReport = data.weightReport;
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

  public get latestMeal(): string {
    let latestMeal = 0;
    for (const kvp of this.meals) {
      if (kvp[1].length === 0)
        continue;
      const order = Diary.orderedMeals.indexOf(kvp[0]);
      latestMeal = Math.max(latestMeal, order);
    }
    return Diary.orderedMeals[latestMeal];
  }

  public get hasContents(): boolean {
    for (const meal of this.meals.values()) {
      if (meal.length > 0) {
        return true;
      }
    }
    return false;
  }

  public getMealProperty(meal: string, property: string): number {
    const portions = this.meals.get(meal);
    let total = 0;
    for (const portion of portions) {
      total += portion.getTotalProperty(property);
    }
    return total;
  }

  public getMealCaloriesPercentage(meal: string): number {
    let mealCalories = 0;
    for (const portion of this.meals.get(meal)) {
      mealCalories += portion.calories;
    }
    return mealCalories / this.calories;
  }

  public getMealProteinCaloriesPercentage(meal: string): number {
    let proteinCalories = 0;
    let totalCalories = 0;
    for (const portion of this.meals.get(meal)) {
      totalCalories += portion.calories;
      proteinCalories += portion.proteins * 4;
    }
    return proteinCalories / totalCalories;
  }

  public recordedMeals(mealType: Meal | string): number {
    const meal = this.meals.get(mealType);
    if (meal === undefined) {
      return 0;
    }
    return meal.length;
  }

  public getPortion(id: string): Portion | undefined {
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
