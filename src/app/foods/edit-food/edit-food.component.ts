import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, map, Observable, of, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FoodsService, GetFoodStatsResponse } from 'src/app/services/foods.service';
import { Food } from 'src/app/models/food.model';
import { UiService } from 'src/app/services/ui.service';
import { FoodProp } from 'src/app/models/food-prop.model';

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
export class EditFoodComponent implements OnInit {

  public get isEditing() { return this.status === EditFoodStatus.Editing; } // turn into observable tk?

  public editFoodStatus = EditFoodStatus;
  public status: EditFoodStatus = undefined;


  FoodProp = FoodProp;

  editForm = new FormGroup({
    name: new FormControl(undefined, [Validators.required, Validators.minLength(4), Validators.maxLength(100)]),
    proteins: new FormControl(undefined, [Validators.required, Validators.max(100)]),
    carbs: new FormControl(undefined, [Validators.required, Validators.max(100)]),
    fats: new FormControl(undefined, [Validators.required, Validators.max(100)]),
    fibres: new FormControl(undefined, [Validators.max(100)]),
    sugar: new FormControl(undefined, [Validators.max(100)]),
    starch: new FormControl(undefined),
    saturated: new FormControl(undefined),
    monounsaturated: new FormControl(undefined),
    polyunsaturated: new FormControl(undefined),
    omega3: new FormControl(undefined),
    omega6: new FormControl(undefined),
    trans: new FormControl(undefined),
    cholesterol: new FormControl(undefined),
    alcohol: new FormControl(undefined),
    sodium: new FormControl(undefined),
    potassium: new FormControl(undefined),
    calcium: new FormControl(undefined),
    magnesium: new FormControl(undefined),
    zinc: new FormControl(undefined),
    iron: new FormControl(undefined),
    source: new FormControl(undefined),
    notes: new FormControl(undefined)
  });

  private food: Readonly<Food>;
  private originalFormValues: Readonly<string>;

  id$: Observable<string> = this.route.params.pipe(map(parameters => parameters.id));

  food$: Observable<Food | undefined> = this.id$.pipe(
    switchMap(id => this.fs.getFood(id)),
    shareReplay(),
    tap(food => {
      this.food = food;       // set food value for resets
      this.editForm.patchValue(food);
      this.originalFormValues = JSON.stringify(this.editForm.value);
      this.disableEdit();
    }));

  foodStats$: Observable<GetFoodStatsResponse> = this.food$.pipe(
    switchMap(food => food === undefined ? of(undefined) : this.fs.foodStats(food.id))
  );

  disabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  private formChanges$ = this.editForm.valueChanges.pipe(
    shareReplay()
  );

  changedForm$: Observable<boolean> = this.formChanges$.pipe(
    startWith(false),
    map(() => this.editForm.dirty),
    shareReplay()     // prevent multiple template subscriptions from triggering the tap and map
  );

  saveable$: Observable<boolean> = this.formChanges$.pipe(
    map(() => this.editForm.valid && this.editForm.dirty)
  );

  resettable$: Observable<boolean>;

  constructor(private fs: FoodsService, public ui: UiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.resettable$ = this.changedForm$.pipe(
      map(changed => changed && JSON.stringify(this.editForm.value) !== this.originalFormValues)
    );
  }

  enableEdit() {
    this.editForm.enable();
    this.disabled$.next(false);
  }

  disableEdit() {
    this.reset();
    this.editForm.disable();
    this.disabled$.next(true);
  }

  reset() {
    this.editForm.patchValue(this.food);
  }

  save() {
    this.fs.editFood({ ...this.editForm.value, id: this.food.id }).subscribe({
      next: () => {
        this.ui.notify(`Updated ${this.editForm.value.name}`);
        this.ui.goToFoods();
      },
      error: error => {
        this.ui.warn(`Couldn't update ${this.editForm.value.name}`);
        console.log(error);
      }
    });
  }


  delete() {
    this.fs.deleteFood(this.food.id).subscribe(() => {
      // this.ui.warn(`Deleted ${food.name} and its ${result.portions.length} portions`);
      this.ui.warn(`Deleted ${this.food.name}`);
      this.ui.goToFoods();
    });
  }

  undoChanges() {
    this.editForm.patchValue(this.food);
  }

  public getDRV(property: FoodProp): number {
    const value: number = +(this.editForm.get(property).value ?? 0);
    return this.fs.getDRV(property, value);
  }
}
