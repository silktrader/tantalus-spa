import { PortionDto } from './portion-dto.model';
import { FoodDto } from './food-dto.model';

export interface DiaryEntryDto {
  readonly comment?: string;
  readonly mood: number;
  readonly fitness: number;
  readonly portions: ReadonlyArray<PortionDto>;
  readonly foods: ReadonlyArray<FoodDto>;
  readonly weightMeasurements: ReadonlyArray<WeightMeasurement>;
}

export interface DiaryEntryPostDto {
  readonly comments?: string;
  readonly portions: ReadonlyArray<PortionDto>;
}

export interface WeightMeasurement {
  weight: number;
  measuredOn: Date;
  impedance?: number;
  note?: string;
}
