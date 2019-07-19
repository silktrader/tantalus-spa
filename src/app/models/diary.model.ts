import { Meal } from './meal.model';
import { Portion } from './portion.model';
import { DiaryEntryDto } from './diary-entry-dto.model';
import { Food } from './food.model';

export class Diary {
  // tk use mapper
  public get dto() {
    return this.diaryDto;
  }

  private foodsMap: Map<number, Food> = new Map<number, Food>();
  public get foods() {
    return this.foodsMap.values;
  }

  private mealsMap: Map<number, Meal> = new Map<number, Meal>();
  public get meals(): ReadonlyArray<Meal> {
    return Array.from(this.mealsMap.values()); // TK slow
  }

  constructor(private readonly diaryDto: DiaryEntryDto) {
    // populate foods map for quick lookup and to avoid multiple identical objects
    for (const foodDto of diaryDto.foods) {
      this.foodsMap.set(foodDto.id, new Food(foodDto));
    }

    // create a collection that will hosts portions according to their ordered meal number
    const orderedMeals = new Map<number, Array<Portion>>();
    for (const mealNumber of Meal.numbers) {
      orderedMeals.set(mealNumber, []);
    }

    // create portions and slot them in the cached meals map
    for (const portionDto of diaryDto.portions) {
      const portion = new Portion(
        portionDto.id,
        portionDto.quantity,
        this.foodsMap.get(portionDto.foodId),
        portionDto.meal
      );

      orderedMeals.get(portion.meal).push(portion);
    }

    // set the final meals map
    for (const mealKvp of orderedMeals) {
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
    return this.foodsMap.size > 0;
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
