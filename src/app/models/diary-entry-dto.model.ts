import { PortionDto } from './portion-dto.model';
import { FoodDto } from './food-dto.model';

export class DiaryEntryDto {
  readonly comment?: string;
  readonly portions: ReadonlyArray<PortionDto>;
  readonly foods: ReadonlyArray<FoodDto>;
}

export interface DiaryEntryPostDto {
  readonly comments?: string;
  readonly portions: ReadonlyArray<PortionDto>;
}
