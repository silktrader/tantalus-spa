import { FoodDto } from './food-dto.model';
import { FoodProp } from './food-prop.model';
import { IPortion } from './portion.interface';

export class Food extends FoodDto implements IPortion {
  constructor(data: FoodDto) {
    super();

    // the object is meant to be immutable so the serialised data which it's built on is always in sync
    this.data = data;
    Object.assign(this, data);
  }

  get calories(): number {
    return this.proteins * 4 + this.carbs * 4 + this.fats * 9 + this.alcohol * 7;
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
    let definedProperties = 0;
    for (const prop of Food.detailProperties) {
      if (this.data[prop] !== undefined && this.data[prop] !== null) {
        definedProperties++;
      }
    }
    return definedProperties / Food.detailProperties.length;
  }

  // tk use mapper
  get deserialised(): FoodDto {
    return this.data;
  }

  private static readonly detailProperties = [
    FoodProp.fibres,
    FoodProp.sugar,
    FoodProp.saturated,
    FoodProp.trans,
    FoodProp.cholesterol,

    FoodProp.sodium,
    FoodProp.calcium,
    FoodProp.potassium,
    FoodProp.magnesium,
    FoodProp.zinc,
    FoodProp.iron
  ];

  private readonly data: FoodDto;
}
