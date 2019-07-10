import { RecipeDto } from './recipe-autocomplete.model';
import { Food } from './food.model';
import { IPortion } from './portion.interface';
import { Ingredient } from './ingredient.interface';

export class Recipe implements IPortion {
  public ingredients: ReadonlyArray<Ingredient>;

  public id: Readonly<number>;
  public name: Readonly<string>;
  public calories: Readonly<number> = 0;
  public proteins: Readonly<number> = 0;
  public carbs: Readonly<number> = 0;
  public fats: Readonly<number> = 0;

  constructor(recipeDto: RecipeDto) {
    this.name = recipeDto.name;
    this.id = recipeDto.id;
    const tmpIngredients: Array<Ingredient> = [];
    for (const ingredient of recipeDto.ingredients) {
      const food = new Food(ingredient.food);
      tmpIngredients.push({ food, quantity: ingredient.quantity });
      this.calories += (food.calories * ingredient.quantity) / 100;
      this.proteins += (food.proteins * ingredient.quantity) / 100;
      this.carbs += (food.carbs * ingredient.quantity) / 100;
      this.fats += (food.fats * ingredient.quantity) / 100;
    }

    // assign array to a readonly field
    this.ingredients = tmpIngredients;
  }
}
