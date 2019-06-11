import { FoodDto } from './food-dto.model';
import { FoodProp } from './food-prop.model';

export class Food extends FoodDto {
  constructor(data: FoodDto) {
    super();

    // the object is meant to be immutable so the serialised data which it's built on is always in sync
    this.data = data;
    Object.assign(this, data);
  }

  get calories(): number {
    return this.proteins * 4 + this.carbs * 4 + this.fats * 9;
  }

  get approximateCalories(): number {
    return Math.round(this.calories);
  }

  get proteinsPercentage(): number {
    return (this.proteins * 4) / this.calories;
  }

  get carbsPercentage(): number {
    return (this.carbs * 4) / this.calories;
  }

  get fatsPercentage(): number {
    return (this.fats * 9) / this.calories;
  }

  get detailsPercentage(): number {
    let undefinedProperties = 0;
    for (const prop of Food.detailProperties) {
      if (this.data[prop] === undefined) {
        undefinedProperties++;
      }
    }
    return 1 - undefinedProperties / Food.detailProperties.length;
  }

  get deserialised(): FoodDto {
    return this.data;
  }

  private static readonly detailProperties = [
    FoodProp.fibres,
    FoodProp.sugar,
    FoodProp.saturated,
    FoodProp.trans,
    FoodProp.cholesterol,
    FoodProp.sodium
  ];

  private readonly data: FoodDto;
}
