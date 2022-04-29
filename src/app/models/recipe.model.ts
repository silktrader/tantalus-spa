import { RecipeGetResponse } from './recipe-autocomplete.model';
import { Food } from './food.model';
import { IPortion } from './portion.interface';
import { Ingredient } from './ingredient.interface';

export class Recipe implements IPortion {
  public ingredients: ReadonlyArray<Ingredient>;

  public id: Readonly<string>;
  public name: Readonly<string>;
  public calories: Readonly<number> = 0;
  public proteins: Readonly<number> = 0;
  public carbs: Readonly<number> = 0;
  public fats: Readonly<number> = 0;

  constructor(recipeResponse: RecipeGetResponse) {
    this.name = recipeResponse.name;
    this.id = recipeResponse.id;
    const tmpIngredients: Array<Ingredient> = [];
    for (const ingredient of recipeResponse.ingredients) {
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

  get ingredientsCount(): number {
    return this.ingredients.length;
  }

}
