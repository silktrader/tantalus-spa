import { PortionDto } from './portion-dto.model';
import { FoodDto } from './food-dto.model';

export interface DiaryEntryDto {
  readonly comment?: string;
  readonly mood: number;
  readonly fitness: number;
  readonly portions: ReadonlyArray<PortionDto>;
  readonly foods: ReadonlyArray<FoodDto>;
  readonly weightReport: WeightReport;
}

export interface DiaryEntryPostDto {
  readonly comments?: string;
  readonly portions: ReadonlyArray<PortionDto>;
}

export interface WeightReport {
  weight: number;
  fat: number;
  measurements: number;
  impedance?: number;
  previousWeightChange: number;
  previousFatChange: number;
  last30DaysWeightChange: number;
  last30DaysFatChange: number;
}
