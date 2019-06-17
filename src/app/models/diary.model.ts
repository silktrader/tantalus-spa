import { Meal } from './meal.model';
import { Portion } from './portion.model';
import { DiaryEntryDto } from './diary-entry-dto.model';
import { Food } from './food.model';

export class Diary {
  private foods: Map<number, Food> = new Map<number, Food>();
  public get Foods() {
    return this.foods.values;
  }

  private meals: Map<number, Meal> = new Map<number, Meal>();
  public get Meals(): ReadonlyArray<Meal> {
    return Array.from(this.meals.values()); // TK slow
  }

  public get hasContents(): boolean {
    return this.foods.size > 0;
  }

  constructor(diaryDto: DiaryEntryDto) {
    // populate foods map for quick lookup and to avoid multiple identical objects
    diaryDto.foods.forEach(foodDto =>
      this.foods.set(foodDto.id, new Food(foodDto))
    );

    diaryDto.portions.forEach(portionDto => {
      // create a meal when it's not present
      let meal = this.meals.get(portionDto.mealNumber);
      if (meal === undefined) {
        meal = new Meal(portionDto.mealNumber);
        this.meals.set(portionDto.mealNumber, meal);
      }

      // add the portion to the meal
      meal.addPortion(
        new Portion(
          portionDto.id,
          portionDto.quantity,
          this.foods.get(portionDto.foodId),
          portionDto.mealNumber
        )
      );
    });
  }

  public getTotalProperty(propertyName: string) {
    let total = 0;
    this.meals.forEach(meal => (total += meal.getTotalProperty(propertyName)));
    return total;
  }
}
