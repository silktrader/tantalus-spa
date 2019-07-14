import { PortionDto } from './portion-dto-model';
import { FoodDto } from './food-dto.model';

export class DiaryEntryDto {
  comments: string;
  portions: PortionDto[] = [];
  foods: FoodDto[] = [];
}
