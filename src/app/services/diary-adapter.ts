import { DiaryEntryDto } from '../models/diary-entry-dto.model';
import { Injectable } from '@angular/core';
import { Diary } from '../models/diary.model';
import { Food } from '../models/food.model';
import { Portion } from '../models/portion.model';
import { PortionDto } from '../models/portion-dto.model';
import { FoodDto } from '../models/food-dto.model';

export interface DtoAdapter<Dto, Model> {
  toModel(dto: Dto): Model;
  toDto(model: Model): Dto;
}

@Injectable({
  providedIn: 'root'
})
export class DiaryAdapter implements DtoAdapter<DiaryEntryDto, Diary> {
  public toModel(dto: DiaryEntryDto): Diary {
    // build foods map
    const foods = new Map<number, Food>();
    console.log(dto.foods);
    for (const foodDto of dto.foods) {
      if (foods.get(foodDto.id)) {
        continue;
      }
      foods.set(foodDto.id, new Food(foodDto));
    }

    const portions: Portion[] = [];
    for (const portionDto of dto.portions) {
      const food = foods.get(portionDto.foodId);
      if (food === undefined) {
        return undefined;
      }
      portions.push(new Portion(portionDto.id, portionDto.quantity, food, portionDto.meal));
    }

    return new Diary(portions, dto.comment);
  }

  public toDto(diary: Diary): DiaryEntryDto {
    const portions = new Array<PortionDto>();
    const foodIds = new Set<number>();
    const foods = new Array<FoodDto>();

    for (const meal of diary.meals) {
      for (const portion of meal.Portions) {
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

    return { portions, foods, comment: diary.comment };
  }
}
