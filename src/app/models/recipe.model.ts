import { RecipeDto } from './recipe-autocomplete.model';
import { Food } from './food.model';

export class Recipe {
  private ingredients = new Map<Food, number>();

  public name: Readonly<string>;
  public calories: Readonly<number> = 0;
  public proteins: Readonly<number> = 0;
  public carbs: Readonly<number> = 0;
  public fats: Readonly<number> = 0;

  constructor(recipeDto: RecipeDto) {
    this.name = recipeDto.name;
    for (const ingredient of recipeDto.ingredients) {
      const food = new Food(ingredient.food);
      this.ingredients.set(food, ingredient.quantity);
      this.calories += (food.calories * ingredient.quantity) / 100;
      this.proteins += (food.proteins * ingredient.quantity) / 100;
      this.carbs += (food.carbs * ingredient.quantity) / 100;
      this.fats += (food.fats * ingredient.quantity) / 100;
    }
  }

  public get ingredientsCount(): number {
    return this.ingredients.size;
  }
}
