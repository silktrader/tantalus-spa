import { PortionDto } from './portion-dto.model';
import { FoodDto } from './food-dto.model';

export class DiaryEntryDto {
  readonly comments?: string;
  readonly portions: ReadonlyArray<PortionDto> = [];
  readonly foods: FoodDto[] = [];
}

export interface DiaryEntryPostDto {
  readonly comments?: string;
  readonly portions: ReadonlyArray<PortionDto>;
}
