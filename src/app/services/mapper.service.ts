import { Portion } from '../models/portion.model';
import { PortionDto } from '../models/portion-dto.model';
import { Food } from '../models/food.model';

export class MapperService {
  public static toDto(portion: Portion): PortionDto {
    return {
      id: portion.id,
      foodId: portion.food.id,
      quantity: portion.quantity,
      meal: portion.meal
    };
  }

  public static toModel(dto: PortionDto, food: Food): Portion {
    return new Portion(dto.id, dto.quantity, food, dto.meal);
  }
}
