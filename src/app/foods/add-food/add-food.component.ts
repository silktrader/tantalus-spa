import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FoodDto } from 'src/app/models/food-dto.model';
import { FoodsService } from 'src/app/services/foods.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.component.html',
  styleUrls: ['./add-food.component.css']
})
export class AddFoodComponent implements OnInit {

  identification = new FormGroup({
    name: new FormControl(undefined, [Validators.required, Validators.minLength(4), Validators.maxLength(100)])
  });

  macronutrients = new FormGroup({
    proteins: new FormControl(0, [Validators.required, Validators.max(100)]),
    carbs: new FormControl(0, [Validators.required, Validators.max(100)]),
    fats: new FormControl(0, [Validators.required, Validators.max(100)]),
  });

  details = new FormGroup({
    fibres: new FormControl(undefined),
    sugar: new FormControl(undefined),
    starch: new FormControl(undefined),
    saturated: new FormControl(undefined),
    monounsaturated: new FormControl(undefined),
    polyunsaturated: new FormControl(undefined),
    trans: new FormControl(undefined),
    cholesterol: new FormControl(undefined),
    omega3: new FormControl(undefined),
    omega6: new FormControl(undefined),
    alcohol: new FormControl(undefined)
  });

  micronutrients = new FormGroup({
    sodium: new FormControl(undefined),
    potassium: new FormControl(undefined),
    calcium: new FormControl(undefined),
    magnesium: new FormControl(undefined),
    zinc: new FormControl(undefined),
    iron: new FormControl(undefined)
  });

  description = new FormGroup({
    source: new FormControl(undefined),
    notes: new FormControl(undefined)
  });

  constructor(private readonly fs: FoodsService, private readonly ui: UiService) { }

  ngOnInit(): void {
    console.log("start");
  }

  public addFood(): void {
    const id = self.crypto.randomUUID();
    let food = { ...this.identification.value, ...this.macronutrients.value, ...this.details.value, ...this.micronutrients.value, ...this.description.value, id };
    food = Object.fromEntries(Object.entries(food).filter(([k, v]) => v != null));
    this.fs.addFood(food).subscribe(
      (food: FoodDto) => {
        this.ui.notify(`Added ${food.name}`, 'View', () => {
          this.ui.goToFood(food.shortUrl);
        });
        this.ui.goToFoods();
      },
      error => {
        console.log(error);
      }
    );
  }

}
