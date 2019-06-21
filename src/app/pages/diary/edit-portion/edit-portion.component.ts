import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Portion } from 'src/app/models/portion.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { PortionQuantityValidator } from 'src/app/validators/portion-quantity.validator';
import { Meal } from 'src/app/models/meal.model';
import { Diary } from 'src/app/models/diary.model';

@Component({
  selector: 'app-edit-portion',
  templateUrl: './edit-portion.component.html',
  styleUrls: ['./edit-portion.component.css']
})
export class EditPortionComponent implements OnInit, OnDestroy {
  private id: number;
  private subscription: Subscription;

  public originalPortion: Portion;
  public previewedPortion: Portion;

  public quantitiesControl = new FormControl('', [
    Validators.required,
    PortionQuantityValidator
  ]);
  public mealSelector = new FormControl();

  public diary: Diary;

  constructor(
    private ds: DiaryService,
    private route: ActivatedRoute,
    private router: Router,
    private ui: UiService
  ) {}

  ngOnInit() {
    if (this.route.parent === null) {
      console.log('issue tk');
      return;
    }

    this.id = +this.route.snapshot.paramMap.get('portionId');

    this.subscription = this.ds.diary$.subscribe(diary => {
      if (diary === undefined) {
        return;
      }
      this.originalPortion = diary.getPortion(this.id);
      if (this.originalPortion === undefined) {
        return;
      }

      this.diary = diary;

      this.previewedPortion = new Portion(
        this.originalPortion.id,
        this.originalPortion.quantity,
        this.originalPortion.food,
        this.originalPortion.mealNumber
      );

      this.quantitiesControl.setValue(this.originalPortion.quantity);
      this.mealSelector.setValue(this.originalPortion.mealNumber);
    });

    this.subscription.add(
      this.quantitiesControl.valueChanges.subscribe((newQuantity: number) => {
        this.previewedPortion = new Portion(
          this.id,
          newQuantity,
          this.previewedPortion.food,
          this.previewedPortion.mealNumber
        );
      })
    );

    this.subscription.add(
      this.mealSelector.valueChanges.subscribe((newMealNumber: number) => {
        this.previewedPortion = new Portion(
          this.id,
          this.previewedPortion.quantity,
          this.previewedPortion.food,
          newMealNumber
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get saveDisabled(): boolean {
    return (
      (!this.quantitiesControl.valid && !this.mealSelector.valid) ||
      (this.quantitiesControl.value === this.originalPortion.quantity &&
        this.mealSelector.value === this.originalPortion.mealNumber)
    );
  }

  get portionUnchanged(): boolean {
    return (
      !this.quantitiesControl.dirty &&
      this.mealSelector.value === this.originalPortion.mealNumber
    );
  }

  get title(): string {
    return 'Edit Portion';
  }

  public back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  public reset(): void {
    this.quantitiesControl.reset(this.originalPortion.quantity);
    this.mealSelector.reset(this.originalPortion.mealNumber);
    this.previewedPortion = this.originalPortion;
  }

  public save(): void {
    this.changePortion(this.originalPortion, this.previewedPortion);
  }

  public delete(): void {
    this.ds.removePortion(this.originalPortion.id).subscribe(
      () => {
        this.notifyDeletedPortion(this.originalPortion);
        this.back();
      },
      error =>
        this.ui.warn(`Couldn't delete portion #${this.originalPortion.id}`)
    );
  }

  private checkPreview(preview: string): string {
    return this.quantitiesControl.valid ? preview : '…';
  }

  public get previewCalories(): string {
    return this.checkPreview(
      this.previewedPortion.calories.toFixed(0) + ' kcal'
    );
  }

  public get previewProteins(): string {
    return this.checkPreview(this.previewedPortion.proteins.toFixed(1) + ' g.');
  }

  public get previewCarbs(): string {
    return this.checkPreview(this.previewedPortion.carbs.toFixed(1) + ' g.');
  }

  public get previewFats(): string {
    return this.checkPreview(this.previewedPortion.fats.toFixed(1) + ' g.');
  }

  private changePortion(initial: Portion, final: Portion): void {
    this.ds
      .changePortion({
        id: final.id,
        foodId: final.foodId,
        mealNumber: final.mealNumber,
        quantity: final.quantity
      })
      .subscribe(
        () => {
          this.notifyChangePortion(initial, final);
          this.back();
        },
        () => this.ui.warn(`Couldn't change portion #${final.id}`)
      );
  }

  private notifyChangePortion(initial: Portion, final: Portion) {
    const quantityDifference = final.quantity - initial.quantity;
    let message = `${initial.food.name}`;

    if (initial.mealNumber !== final.mealNumber) {
      message += ` moved to ${Meal.getName(final.mealNumber)}`;
      if (quantityDifference !== 0) {
        message += `, `;
      }
    }

    if (quantityDifference > 0) {
      message += ` increased by ${quantityDifference}g.`;
    } else if (quantityDifference < 0) {
      message += ` decreased by ${-quantityDifference}g.`;
    }

    this.ui.notify(message, 'Undo', () => this.changePortion(final, initial));
  }

  private notifyDeletedPortion(portion: Portion) {
    this.ui.notify(`Removed ${portion.food.name}`, 'Undo', () => {
      this.ds.addPortion({
        foodId: portion.food.id,
        quantity: portion.quantity,
        mealNumber: portion.mealNumber
      });
    });
  }

  getQuantitiesControlError() {
    if (this.quantitiesControl.hasError('required')) {
      return 'Required';
    }
    if (this.quantitiesControl.hasError('integer')) {
      return 'No decimals';
    }
    if (this.quantitiesControl.hasError('range')) {
      return 'Must be within [0, 5,000] grams';
    }
    return '';
  }
}
