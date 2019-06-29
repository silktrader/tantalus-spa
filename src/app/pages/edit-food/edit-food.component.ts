import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  NavigationEnd,
  Event
} from '@angular/router';
import { MatDialog } from '@angular/material';
// import { DeleteFoodDialogComponent } from '../delete-food-dialog/delete-food-dialog.component';
import { FoodsService } from 'src/app/services/foods.service';
import { Food } from 'src/app/models/food.model';
import { UiService } from 'src/app/services/ui.service';
import { FoodDto } from 'src/app/models/food-dto.model';

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
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  // private changeFood(food: Food, values: FoodData): void {
  //   this.foodsService.editFood({ id: food.id, ...values }).then(() => {
  //     this.ui.notify(`Changed ${values.name}`, 'Undo', () => {
  //       this.foodsService.editFood(food.deserialised);
  //       this.ui.warn(`Reverted changes to ${food.name}`);
  //     });
  //     this.ui.goBack();
  //   });
  // }

  // onDelete() {

  //   const dialogRef = this.dialog.open(DeleteFoodDialogComponent, {
  //     data: { food: this.food },
  //   });

  //   dialogRef.afterClosed().subscribe(
  // (result: { documents: Array<IDiaryEntryData>, portions: Array<{ date: string, portion: Portion }> }) => {
  //     if (result && this.food) {
  //       const food = this.food;     // undefined scoped check
  //       this.foodsService.deleteFood(food, result.documents).then(() => {
  //         this.ui.warn(`Deleted ${food.name} and its ${result.portions.length} portions`);
  //       });
  //     }
  //   });
  // }

  public get editable() {
    return this.food !== undefined;
  }

  public get deletable() {
    return this.editable;
  }

  private isSaveableFlag = false;
  public get isSaveable() {
    return this.isSaveableFlag;
  }

  private isResettableFlag = false;
  public get isResettable() {
    return this.isResettableFlag;
  }

  public get isNew(): boolean {
    return !this.food;
  }
  public addFoodForm: FormGroup;
  private unmodifiedState;

  // undefined when the food is being added
  private food: Food | undefined;

  private subscription: Subscription;

  ngOnInit() {
    this.addFoodForm = this.fb.group(
      {
        name: '',
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
      }
      // {
      //   hideRequired: false
      // }
    );

    this.subscription = this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id = params.get('id');
          if (id === null) {
            return of(undefined);
          }
          return this.foodsService.getFood(+id);
        })
      )
      .subscribe(food => {
        this.food = food;
        if (food === undefined) {
          return;
        }

        this.addFoodForm.patchValue(food);
        this.unmodifiedState = JSON.stringify(this.addFoodForm.value);
      });

    this.subscription.add(
      this.addFoodForm.valueChanges.subscribe(newValue => {
        // store the form's saveable state to avoid unnecessary calls from multiple elements
        const jsonValue = JSON.stringify(newValue);
        this.isResettableFlag =
          this.unmodifiedState && jsonValue !== this.unmodifiedState;
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
    // const dialogRef = this.dialog.open(DeleteFoodDialogComponent, {
    //   data: { food: this.food },
    // });

    // dialogRef.afterClosed().subscribe(
    // (result: { documents: Array<IDiaryEntryData>, portions: Array<{ date: string, portion: Portion }> }) => {
    //   if (result && this.food) {
    //     const food = this.food;     // undefined scoped check
    //     this.foodsService.deleteFood(food, result.documents).then(() => {
    //       this.ui.warn(`Deleted ${food.name} and its ${result.portions.length} portions`);
    //     });
    //   }
    // });
  }

  public undoChanges() {
    this.addFoodForm.patchValue(JSON.parse(this.unmodifiedState));
  }
}
