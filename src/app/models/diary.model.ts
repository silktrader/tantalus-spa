import { Meal } from './meal.model';
import { Portion } from './portion.model';
import { DiaryEntryDto } from './diary-entry-dto.model';
import { Food } from './food.model';

export class Diary {
  private readonly diaryDto: DiaryEntryDto;
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

  constructor(diaryDto: DiaryEntryDto) {
    this.diaryDto = diaryDto;
    // populate foods map for quick lookup and to avoid multiple identical objects
    for (const foodDto of diaryDto.foods) {
      this.foodsMap.set(foodDto.id, new Food(foodDto));
    }

    // tk remove forEach and switch to for of
    diaryDto.portions.forEach(portionDto => {
      // create a meal when it's not present
      let meal = this.mealsMap.get(portionDto.mealNumber);
      if (meal === undefined) {
        meal = new Meal(portionDto.mealNumber);
        this.mealsMap.set(portionDto.mealNumber, meal);
      }

      // add the portion to the meal
      meal.addPortion(
        new Portion(
          portionDto.id,
          portionDto.quantity,
          this.foodsMap.get(portionDto.foodId),
          portionDto.mealNumber
        )
      );
    });
  }

  public getTotalProperty(propertyName: string) {
    let total = 0;
    this.mealsMap.forEach(
      meal => (total += meal.getTotalProperty(propertyName))
    );
    return total;
  }

  public get latestMeal(): number {
    let latestMeal = 0;
    this.mealsMap.forEach(meal => {
      if (meal.order > latestMeal) {
        latestMeal = meal.order;
      }
    });
    return latestMeal;
  }

  public get hasContents(): boolean {
    return this.foodsMap.size > 0;
  }

  /** Which meals can be recorded [0-5] */
  public get availableMeals(): ReadonlyArray<number> {
    return Meal.mealNumbers;
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
