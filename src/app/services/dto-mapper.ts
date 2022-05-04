import { DiaryEntryDto } from '../models/diary-entry-dto.model';
import { Injectable } from '@angular/core';
import { Diary } from '../models/diary.model';
import { Food } from '../models/food.model';
import { Portion } from '../models/portion.model';
import { PortionDto } from '../models/portion-dto.model';
import { FoodDto } from '../models/food-dto.model';
import { PortionAddDto } from '../models/portion-add-dto.model';

/**
 * Ideally this service should implement various interfaces which are then injected into components.
 * Angular requires additional code and a token though.
 */
@Injectable({ providedIn: 'root' })
export class DtoMapper {
  public mapPortionDto(portion: Portion): PortionDto {
    return {
      id: portion.id,
      foodId: portion.food.id,
      quantity: portion.quantity,
      meal: portion.meal
    };
  }

  public mapPortionAddDto(portion: Portion): PortionAddDto {
    return {
      foodId: portion.food.id,
      quantity: portion.quantity,
      meal: portion.meal
    };
  }

  public mapPortion(dto: PortionDto, food: Food): Portion {
    return new Portion(dto.id, dto.quantity, food, dto.meal);
  }

  public mapDiary(dto: DiaryEntryDto): Diary {
    // build foods map, default to empty array when the property is missing
    const foods = new Map<string, Food>();
    for (const foodDto of dto.foods ?? []) {
      if (foods.get(foodDto.id)) {
        continue;
      }
      foods.set(foodDto.id, new Food(foodDto));
    }

    const portions: Array<Portion> = [];
    for (const portionDto of dto.portions ?? []) {
      const food = foods.get(portionDto.foodId);
      if (food === undefined) {
        return undefined;
      }
      portions.push(new Portion(portionDto.id, portionDto.quantity, food, portionDto.meal));
    }

    return new Diary(portions, dto);
  }

  public mapDiaryDto(diary: Diary): DiaryEntryDto {
    const portions = new Array<PortionDto>();
    const foodIds = new Set<string>();
    const foods = new Array<FoodDto>();

    for (const meal of diary.meals.values()) {
      for (const portion of meal) {
        // serialise portions
        portions.push({
          id: portion.id,
          foodId: portion.food.id,
          meal: portion.meal,
          quantity: portion.quantity
        });

        // serialise foods
        if (foodIds.has(portion.food.id)) {
          continue;
        }
        foods.push(portion.food.deserialised);
      }
    }

    return { portions, foods, comment: diary.comment, mood: diary.mood, fitness: diary.fitness };
  }
}
