/**
 * Model class substituting interface to remove duplication of fields in children classes: stores data, can't feature properties
 */
export class FoodDto {
  public readonly id: number;

  public readonly name: string;
  public readonly proteins: number;
  public readonly carbs: number;
  public readonly fats: number;

  public readonly source?: string;
  public readonly notes?: string;

  public readonly fibres?: number;
  public readonly sugar?: number;
  public readonly starch?: number;

  public readonly saturated?: number;
  public readonly monounsaturated?: number;
  public readonly polyunsaturated?: number;
  public readonly trans?: number;
  public readonly cholesterol?: number;
  public readonly omega3?: number;
  public readonly omega6?: number;

  public readonly sodium?: number;
  public readonly potassium?: number;
  public readonly calcium?: number;
  public readonly magnesium?: number;
  public readonly zinc?: number;
  public readonly iron?: number;

  public readonly alcohol?: number;
}
