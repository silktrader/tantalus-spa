import { Component, OnInit } from '@angular/core';
import { DiaryService } from 'src/app/services/diary.service';
import { FoodsService } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';
import { Recipe } from 'src/app/models/recipe.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-recipe-portions',
  templateUrl: './add-recipe-portions.component.html',
  styleUrls: ['./add-recipe-portions.component.css']
})
export class AddRecipePortionsComponent implements OnInit {
  public recipe: Recipe;

  public editQuantities: FormGroup;

  constructor(
    public ds: DiaryService,
    private fs: FoodsService,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.recipe = history.state.recipe;

    this.editQuantities = new FormGroup({});
    for (const ingredient of this.recipe.ingredientsMap) {
      this.editQuantities.addControl(
        ingredient[0].id.toString(),
        new FormControl(ingredient[1], Validators.required)
      );
    }
  }

  removeIngredient(id: string): void {
    this.editQuantities.removeControl(id);
  }

  get saveable(): boolean {
    return true;
  }

  save(): void {}
}
