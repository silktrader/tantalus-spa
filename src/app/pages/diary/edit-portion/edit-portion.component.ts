import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Portion } from 'src/app/models/portion.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { Meal } from 'src/app/models/meal.model';
import { Diary } from 'src/app/models/diary.model';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';
import { MapperService } from 'src/app/services/mapper.service';

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

  public quantitiesControl = new FormControl('', [Validators.required, PortionValidators.quantity]);
  public mealSelector = new FormControl();

  public diary: Diary;

  constructor(
    public ds: DiaryService,
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
        this.originalPortion.meal
      );

      this.quantitiesControl.setValue(this.originalPortion.quantity);
      this.mealSelector.setValue(this.originalPortion.meal);
    });

    this.subscription.add(
      this.quantitiesControl.valueChanges.subscribe((newQuantity: number) => {
        this.previewedPortion = new Portion(
          this.id,
          newQuantity,
          this.previewedPortion.food,
          this.previewedPortion.meal
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
        this.mealSelector.value === this.originalPortion.meal)
    );
  }

  get portionUnchanged(): boolean {
    return !this.quantitiesControl.dirty && this.mealSelector.value === this.originalPortion.meal;
  }

  public back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  public reset(): void {
    this.quantitiesControl.reset(this.originalPortion.quantity);
    this.mealSelector.reset(this.originalPortion.meal);
    this.previewedPortion = this.originalPortion;
  }

  public save(): void {
    this.changePortion(this.originalPortion, this.previewedPortion);
  }

  public delete(): void {
    // cache the portion to avoid missing references when updating the diary
    const deletedPortion = this.originalPortion;
    this.ds.removePortion(this.originalPortion.id).subscribe({
      next: () => {
        this.ui.notifyRemovePortion(deletedPortion.food.name, () => {
          this.ds.addPortion(MapperService.toDto(deletedPortion)).subscribe(() => {
            this.ui.notifyRestorePortion(deletedPortion.food.name);
          });
        });
        this.back();
      },
      error: () => this.ui.warnFailedRemoval(deletedPortion.id)
    });
  }

  private checkPreview(preview: string): string {
    return this.quantitiesControl.valid ? preview : '…';
  }

  public get previewCalories(): string {
    return this.checkPreview(this.previewedPortion.calories.toFixed(0) + ' kcal');
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
    this.ds.changePortion(MapperService.toDto(final)).subscribe(
      () => {
        this.ui.notifyChangePortion(
          {
            quantity: initial.quantity,
            meal: initial.meal,
            foodName: initial.food.name
          },
          {
            quantity: final.quantity,
            meal: initial.meal
          },
          () => {
            this.changePortion(final, initial);
          }
        );
        this.back();
      },
      () => this.ui.warnFailedChangePortion(initial.id)
    );
  }

  public get quantityError(): string {
    return PortionValidators.getQuantityError(this.quantitiesControl);
  }
}
