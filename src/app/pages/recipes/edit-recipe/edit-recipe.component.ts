import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { FoodsService } from 'src/app/services/foods.service';
import { Observable, Subscription, of } from 'rxjs';
import {
  RecipeFoodDto,
  RecipeDto,
  SaveRecipeDto
} from 'src/app/models/recipe-autocomplete.model';
import { RecipesService } from 'src/app/services/recipes.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe } from 'src/app/models/recipe.model';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.css']
})
export class EditRecipeComponent implements OnInit {
  originalRecipe: Recipe;
  editRecipeForm: FormGroup;
  foodsFilters: Observable<RecipeFoodDto[]>[] = [];
  subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private fs: FoodsService,
    private rs: RecipesService,
    private ui: UiService,
    private route: ActivatedRoute
  ) {}

  public get ingredients(): FormArray {
    return this.editRecipeForm.get('ingredients') as FormArray;
  }

  ngOnInit() {
    this.editRecipeForm = this.fb.group({
      name: '',
      ingredients: this.fb.array([])
    });

    this.subscription = this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id = params.get('id');
          if (id === 'new') {
            return of(undefined);
          }
          return this.rs.findRecipe(+id);
        })
      )
      .subscribe((recipe: Recipe) => {
        if (recipe === undefined) {
          this.addIngredient(undefined, 100);
          return;
        }

        this.originalRecipe = recipe;
        this.editRecipeForm.get('name').setValue(recipe.name);
        for (const item of recipe.ingredients) {
          this.addIngredient({ id: item[0].id, name: item[0].name }, item[1]);
        }
      });
  }

  private createIngredientField(
    recipeFoodDto: RecipeFoodDto | undefined,
    quantity: number
  ): FormGroup {
    return this.fb.group({
      food: [recipeFoodDto || '', Validators.required],
      quantity: [
        quantity,
        Validators.compose([
          Validators.required,
          Validators.max(1000),
          Validators.min(0)
        ])
      ]
    });
  }

  public filteredFoods(index: number) {
    return this.foodsFilters[index];
  }

  displayFoodInfo(foodInfo?: RecipeFoodDto): string | undefined {
    return foodInfo ? foodInfo.name : undefined;
  }

  public addIngredient(
    recipeFoodDto: RecipeFoodDto | undefined,
    quantity: number
  ): void {
    const index = this.ingredients.length;
    this.ingredients.push(this.createIngredientField(recipeFoodDto, quantity));
    this.foodsFilters.push(
      this.ingredients.at(index).valueChanges.pipe(
        debounceTime(400),
        switchMap(value => this.fs.getAutocompleteFoods(value.food))
      )
    );
  }

  public removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
    this.foodsFilters.splice(index);
  }

  public save(): void {
    // pack a usable JSON object from the form
    const ingredients: Array<{ foodId: number; quantity: number }> = [];
    for (const field of this.editRecipeForm.get('ingredients').value) {
      ingredients.push({ foodId: field.food.id, quantity: field.quantity });
    }
    const recipeDto: SaveRecipeDto = {
      name: this.editRecipeForm.get('name').value,
      ingredients
    };

    if (this.originalRecipe === undefined) {
      this.rs.saveRecipe(recipeDto).subscribe(
        value => {
          this.ui.notify(`Saved recipe ${recipeDto.name}`);
        },
        errorResponse => {
          this.ui.warn(`Error: ${errorResponse}`);
        }
      );
    } else {
      this.rs
        .editRecipe(this.originalRecipe.id, {
          ...recipeDto,
          id: this.originalRecipe.id
        })
        .subscribe(
          response => this.ui.notify(`Edited recipe ${recipeDto.name}`),
          error => this.ui.warn(`Error: ${error}`)
        );
    }
  }

  public get saveable(): boolean {
    return this.editRecipeForm.valid;
  }
}
