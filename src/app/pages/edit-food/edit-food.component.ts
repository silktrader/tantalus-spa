import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
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
  ) {}

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

  public addFoodForm: FormGroup;
  private unmodifiedState;

  // undefined when the food is being added
  public food: Food | undefined;

  private subscription = new Subscription();

  public get IdString(): string {
    return this.route.snapshot.params.id;
  }

  public get isAddingFood(): boolean {
    return this.food === undefined && this.status === EditFoodStatus.Editing;
  }

  public get isChangingFood(): boolean {
    return this.food !== undefined && this.status === EditFoodStatus.Editing;
  }

  ngOnInit() {
    // adding a new food; there's no ID
    if (this.IdString === undefined) {
      this.setupForm();
      this.status = EditFoodStatus.Editing;
    } else {
      const id = Number(this.IdString);

      // attempting to edit a food with an invalid ID
      if (isNaN(id) || id <= 0) {
        this.status = EditFoodStatus.InvalidID;
      } else {
        // finally attempt to fetch the food
        this.foodsService.getFood(id).subscribe(food => {
          // handles the not found result
          if (food === undefined) {
            this.status = EditFoodStatus.NotFound;
            return;
          }

          this.food = food;
          this.setupForm();

          // the status triggers the form's presence
          this.status = EditFoodStatus.Editing;
          this.addFoodForm.patchValue(food);
          this.unmodifiedState = JSON.stringify(this.addFoodForm.value);
        });
      }
    }
  }

  private setupForm() {
    this.addFoodForm = this.fb.group({
      name: undefined,
      proteins: 0,
      carbs: 0,
      fats: 0,

      fibres: undefined,
      sugar: undefined,
      starch: undefined,

      saturated: undefined,
      monounsaturated: undefined,
      polyunsaturated: undefined,
      trans: undefined,
      cholesterol: undefined,
      omega3: undefined,
      omega6: undefined,

      sodium: undefined,
      potassium: undefined,
      calcium: undefined,
      magnesium: undefined,
      zinc: undefined,
      iron: undefined,
      alcohol: undefined,
      notes: undefined,
      source: undefined
    });

    this.subscription.add(
      this.addFoodForm.valueChanges.subscribe(newValue => {
        // the form can be reset when no food's being edited or when there the food's values and the fields contents differ
        if (this.unmodifiedState === undefined && this.addFoodForm.dirty) {
          this.isResettableFlag = true;
        } else if (this.unmodifiedState !== JSON.stringify(newValue)) {
          // store the form's saveable state to avoid unnecessary calls from multiple elements
          this.isResettableFlag = true;
        }
        this.isSaveableFlag = this.addFoodForm.valid && this.isResettableFlag;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSubmit(): void {
    // read new values, including name
    const form = this.addFoodForm.value;

    // changing the food entails different notifications
    if (this.food) {
      this.editFood(form);
    } else {
      this.addFood(form);
    }
  }

  private editFood(values: FoodDto): void {
    this.foodsService.editFood({ ...values, id: this.food.id }).subscribe(
      (food: FoodDto) => {
        this.ui.notify(`Updated ${food.name}`);
        this.ui.goToFoods();
      },
      error => {
        this.ui.warn(`Couldn't update ${values.name}`);
        console.log(error);
      }
    );
  }

  private addFood(values: FoodDto): void {
    this.foodsService.addFood(values).subscribe(
      (food: FoodDto) => {
        this.ui.notify(`Added ${food.name} (#${food.id})`, 'View', () => {
          this.ui.goToFood(food.id);
        });
        this.ui.goToFoods();
      },
      error => {
        console.log(error);
      }
    );
  }

  onDelete() {
    this.foodsService.deleteFood(this.food.id).subscribe(() => {
      // this.ui.warn(`Deleted ${food.name} and its ${result.portions.length} portions`);
      this.ui.warn(`Deleted ${this.food.name}`);
      this.ui.goToFoods();
    });
  }

  public undoChanges() {
    if (this.unmodifiedState) {
      this.addFoodForm.patchValue(JSON.parse(this.unmodifiedState));
    } else {
      this.addFoodForm.reset();
    }
  }
}
