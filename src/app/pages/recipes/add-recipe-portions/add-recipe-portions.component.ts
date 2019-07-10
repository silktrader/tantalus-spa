import { Component, OnInit } from '@angular/core';
import { DiaryService } from 'src/app/services/diary.service';
import { FoodsService } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';
import { Recipe } from 'src/app/models/recipe.model';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Ingredient } from 'src/app/models/ingredient.interface';

@Component({
  selector: 'app-add-recipe-portions',
  templateUrl: './add-recipe-portions.component.html',
  styleUrls: ['./add-recipe-portions.component.css']
})
export class AddRecipePortionsComponent implements OnInit {
  public readonly originalRecipe: Recipe;
  public ingredients: Array<Ingredient>;
  public ingredientsForm: FormGroup;
  public mealSelector = new FormControl();

  constructor(public ds: DiaryService, private ui: UiService) {
    this.originalRecipe = history.state.recipe;
    this.mealSelector.setValue(history.state.selectedMeal || 0); // tk replace with fetch last meal
  }

  ngOnInit() {
    this.reset();
  }

  get ingredientsControls(): FormArray {
    return this.ingredientsForm.get('ingredients') as FormArray;
  }

  removeIngredient(index: number): void {
    this.ingredientsControls.removeAt(index);
    this.ingredients.splice(index, 1);
  }

  get saveable(): boolean {
    return this.changed && this.ingredientsForm.valid;
  }

  save(): void {}

  get changed(): boolean {
    const controls = this.ingredientsControls;
    if (controls === undefined) {
      return false;
    }

    for (let i = 0; i < this.originalRecipe.ingredients.length; i += 1) {
      const matchingControl = this.ingredientsControls.controls[i];
      if (matchingControl === undefined) {
        return true;
      }

      if (
        matchingControl.value !== this.originalRecipe.ingredients[i].quantity
      ) {
        return true;
      }
    }
    return false;
  }

  reset(): void {
    this.ingredients = [...this.originalRecipe.ingredients];
    this.ingredientsForm = new FormGroup({
      ingredients: new FormArray(
        this.ingredients.map(
          ingredient =>
            new FormControl(ingredient.quantity, Validators.required)
        )
      )
    });
  }
}
