import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { FoodsService } from 'src/app/services/foods.service';
import { Observable } from 'rxjs';
import {
  RecipeFoodDto,
  RecipeDto
} from 'src/app/models/recipe-autocomplete.model';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css']
})
export class AddRecipeComponent implements OnInit {
  constructor(private fb: FormBuilder, private fs: FoodsService) {}

  public get ingredients(): FormArray {
    return this.editRecipeForm.get('ingredients') as FormArray;
  }
  public editRecipeForm: FormGroup;

  foodsFilters: Observable<RecipeFoodDto[]>[] = [];

  ngOnInit() {
    this.editRecipeForm = this.fb.group({
      name: '',
      ingredients: this.fb.array([])
    });

    this.addIngredient();
  }

  private createIngredientField(): FormGroup {
    return this.fb.group({
      food: ['', Validators.required],
      quantity: [
        100,
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

  public addIngredient(): void {
    const index = this.ingredients.length;
    this.ingredients.push(this.createIngredientField());
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
    const ingredients: { id: number; quantity: number }[] = [];
    for (const field of this.editRecipeForm.get('ingredients').value) {
      ingredients.push({ id: field.food.id, quantity: field.quantity });
    }
    const recipeDto: RecipeDto = {
      name: this.editRecipeForm.get('name').value,
      ingredients
    };
    console.log(recipeDto);
  }

  public get saveable(): boolean {
    return this.editRecipeForm.valid;
  }
}
