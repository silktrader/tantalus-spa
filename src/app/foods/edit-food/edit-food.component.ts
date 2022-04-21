import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FoodsService } from 'src/app/services/foods.service';
import { Food } from 'src/app/models/food.model';
import { UiService } from 'src/app/services/ui.service';
import { FoodDto } from 'src/app/models/food-dto.model';

enum EditFoodStatus {
  Editing,
  InvalidID,
  NotFound
}

@Component({
  selector: 'app-edit-food',
  templateUrl: './edit-food.component.html',
  styleUrls: ['./edit-food.component.css']
})
export class EditFoodComponent implements OnInit, OnDestroy {
  constructor(
    private foodsService: FoodsService,
    public ui: UiService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) { }

  public get isEditing() { return this.status === EditFoodStatus.Editing; } // turn into observable tk?

  public editFoodStatus = EditFoodStatus;
  public status: EditFoodStatus = undefined;

  private isSaveableFlag = false;
  public get isSaveable() {
    return this.isSaveableFlag;
  }

  private isResettableFlag = false;
  public get isResettable() {
    return this.isResettableFlag;
  }

  public editForm: FormGroup;

  private unmodifiedState;

  public food: Food;

  private subscription = new Subscription();

  public get FoodIdentifier(): string {
    return this.route.snapshot.params.id;
  }

  ngOnInit() {
    // one could get the food from the store, or the history's state but fetching a new copy seems safer
    this.foodsService.getFood(this.FoodIdentifier).subscribe(food => {
      // handles the not found result
      if (food === undefined) {
        this.status = EditFoodStatus.NotFound;
        return;
      }

      this.food = food;
      this.setupForm(food);

      // the status triggers the form's presence
      this.status = EditFoodStatus.Editing;
      this.unmodifiedState = JSON.stringify(this.editForm.value);
    });
  }

  private setupForm(food: Food) {
    this.editForm = new FormGroup({
      name: new FormControl(food.name, [Validators.required, Validators.minLength(4), Validators.maxLength(100)]),
      proteins: new FormControl(food.proteins, [Validators.required, Validators.max(100)]),
      carbs: new FormControl(food.carbs, [Validators.required, Validators.max(100)]),
      fats: new FormControl(food.fats, [Validators.required, Validators.max(100)]),
      fibres: new FormControl(food.fibres, [Validators.max(100)]),
      sugar: new FormControl(food.sugar, [Validators.max(100)]),
      starch: new FormControl(food.starch),
      saturated: new FormControl(food.saturated),
      monounsaturated: new FormControl(food.monounsaturated),
      polyunsaturated: new FormControl(food.polyunsaturated),
      trans: new FormControl(food.trans),
      cholesterol: new FormControl(food.cholesterol),
      omega3: new FormControl(food.omega3),
      omega6: new FormControl(food.omega6),
      alcohol: new FormControl(food.alcohol),
      sodium: new FormControl(food.sodium),
      potassium: new FormControl(food.potassium),
      calcium: new FormControl(food.calcium),
      magnesium: new FormControl(food.magnesium),
      zinc: new FormControl(food.zinc),
      iron: new FormControl(food.iron),
      source: new FormControl(food.source),
      notes: new FormControl(food.notes)
    });

    this.subscription.add(
      this.editForm.valueChanges.subscribe(newValue => {
        // the form can be reset when no food's being edited or when there the food's values and the fields contents differ
        if (this.unmodifiedState === undefined && this.editForm.dirty) {
          this.isResettableFlag = true;
        } else if (this.unmodifiedState !== JSON.stringify(newValue)) {
          // store the form's saveable state to avoid unnecessary calls from multiple elements
          this.isResettableFlag = true;
        }
        this.isSaveableFlag = this.editForm.valid && this.isResettableFlag;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public saveEdit() {
    this.foodsService.editFood({ ...this.editForm.value, id: this.food.id }).subscribe(
      () => {
        this.ui.notify(`Updated ${this.editForm.value.name}`);
        this.ui.goToFoods();
      },
      error => {
        this.ui.warn(`Couldn't update ${this.editForm.value.name}`);
        console.log(error);
      }
    );
  }

  delete() {
    this.foodsService.deleteFood(this.food.id).subscribe(() => {
      // this.ui.warn(`Deleted ${food.name} and its ${result.portions.length} portions`);
      this.ui.warn(`Deleted ${this.food.name}`);
      this.ui.goToFoods();
    });
  }

  public undoChanges() {
    if (this.unmodifiedState) {
      this.editForm.patchValue(JSON.parse(this.unmodifiedState));
    } else {
      this.editForm.reset();
    }
  }
}
