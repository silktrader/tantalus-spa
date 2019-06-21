import { Meal } from './meal.model';
import { Portion } from './portion.model';
import { DiaryEntryDto } from './diary-entry-dto.model';
import { Food } from './food.model';

export class Diary {
  private _foods: Map<number, Food> = new Map<number, Food>();
  public get foods() {
    return this._foods.values;
  }

  private _meals: Map<number, Meal> = new Map<number, Meal>();
  public get meals(): ReadonlyArray<Meal> {
    return Array.from(this._meals.values()); // TK slow
  }

  constructor(diaryDto: DiaryEntryDto) {
    // populate foods map for quick lookup and to avoid multiple identical objects
    diaryDto.foods.forEach(foodDto =>
      this._foods.set(foodDto.id, new Food(foodDto))
    );

    diaryDto.portions.forEach(portionDto => {
      // create a meal when it's not present
      let meal = this._meals.get(portionDto.mealNumber);
      if (meal === undefined) {
        meal = new Meal(portionDto.mealNumber);
        this._meals.set(portionDto.mealNumber, meal);
      }

      // add the portion to the meal
      meal.addPortion(
        new Portion(
          portionDto.id,
          portionDto.quantity,
          this._foods.get(portionDto.foodId),
          portionDto.mealNumber
        )
      );
    });
  }

  public getTotalProperty(propertyName: string) {
    let total = 0;
    this._meals.forEach(meal => (total += meal.getTotalProperty(propertyName)));
    return total;
  }

  public get latestMeal(): number {
    let latestMeal = 0;
    this._meals.forEach(meal => {
      if (meal.order > latestMeal) {
        latestMeal = meal.order;
      }
    });
    return latestMeal;
  }

  public get hasContents(): boolean {
    return this._foods.size > 0;
  }

  /** Which meals can be recorded [0-5] */
  public get availableMeals(): ReadonlyArray<number> {
    return Meal.mealNumbers;
  }

  public getMealName(mealNumber: number): string {
    return Meal.mealNames[mealNumber];
  }

  public recordedMeals(mealNumber: number): number {
    const meal = this._meals.get(mealNumber);
    if (meal === undefined) {
      return 0;
    }
    return meal.Portions.length;
  }

  public getPortion(id: number): Portion | undefined {
    for (const meal of this._meals.values()) {
      for (const portion of meal.Portions) {
        if (portion.id === id) { return portion; }
      }
    }

    return undefined;
  }
}
