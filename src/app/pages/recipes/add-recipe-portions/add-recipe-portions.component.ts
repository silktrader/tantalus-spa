import { Component, OnInit } from '@angular/core';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { Recipe } from 'src/app/models/recipe.model';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Ingredient } from 'src/app/models/ingredient.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from 'src/app/services/recipes.service';

@Component({
  selector: 'app-add-recipe-portions',
  templateUrl: './add-recipe-portions.component.html',
  styleUrls: ['./add-recipe-portions.component.css']
})
export class AddRecipePortionsComponent implements OnInit {
  public originalRecipe: Recipe;
  public ingredients: Array<Ingredient>;
  public ingredientsForm: FormGroup;
  public mealSelector = new FormControl();

  constructor(
    public ds: DiaryService,
    private rs: RecipesService,
    private ui: UiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // fill the recipe's details from the router supplied data or fetch them during reloads or manual URL entries
    if (history.state && history.state.recipe) {
      this.originalRecipe = history.state.recipe;
      this.mealSelector.setValue(history.state.meal);
      this.reset();
    } else {
      this.rs.findRecipe(+this.route.snapshot.paramMap.get('recipeId')).subscribe(recipe => {
        this.originalRecipe = recipe;
        this.mealSelector.setValue(this.ds.focusedMeal);
        this.reset();
      });
    }
  }

  ngOnInit() { }

  get ingredientsControls(): FormArray {
    return this.ingredientsForm.get('ingredients') as FormArray;
  }

  removeIngredient(index: number): void {
    this.ingredientsControls.removeAt(index);
    this.ingredients.splice(index, 1);
  }

  get saveable(): boolean {
    return this.ingredients.length > 0 && this.ingredientsForm.valid;
  }

  public save(): void {
    this.ds
      .addPortions(
        this.ingredients.map(ingredient => ({
          foodId: ingredient.food.id,
          quantity: ingredient.quantity,
          meal: this.mealSelector.value
        }))
      )
      .subscribe(dtos => {
        this.router.navigate(['../..'], { relativeTo: this.route });
        this.ui.notifyAddedRecipe(dtos.length, this.originalRecipe.name, () => {
          this.ds
            .removePortions(dtos.map(dto => dto.id))
            .subscribe(
              () => this.ui.notifyRemovedPortions(dtos.length),
              error => this.ui.warnFailedRemovals(dtos.map(dto => dto.id))
            );
        });
      });
  }

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

      if (matchingControl.value !== this.originalRecipe.ingredients[i].quantity) {
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
          ingredient => new FormControl(ingredient.quantity, Validators.required)
        )
      )
    });
  }
}
