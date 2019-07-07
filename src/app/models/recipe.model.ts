import { RecipeDto } from './recipe-autocomplete.model';
import { Food } from './food.model';

export class Recipe {
  private ingredientsMap = new Map<Food, number>();
  public get ingredients(): ReadonlyMap<Food, number> {
    return this.ingredientsMap;
  }

  public id: Readonly<number>;
  public name: Readonly<string>;
  public calories: Readonly<number> = 0;
  public proteins: Readonly<number> = 0;
  public carbs: Readonly<number> = 0;
  public fats: Readonly<number> = 0;

  constructor(recipeDto: RecipeDto) {
    this.name = recipeDto.name;
    this.id = recipeDto.id;
    for (const ingredient of recipeDto.ingredients) {
      const food = new Food(ingredient.food);
      this.ingredientsMap.set(food, ingredient.quantity);
      this.calories += (food.calories * ingredient.quantity) / 100;
      this.proteins += (food.proteins * ingredient.quantity) / 100;
      this.carbs += (food.carbs * ingredient.quantity) / 100;
      this.fats += (food.fats * ingredient.quantity) / 100;
    }
  }

  public get ingredientsCount(): number {
    return this.ingredientsMap.size;
  }
}
