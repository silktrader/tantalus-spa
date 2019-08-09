import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Portion } from 'src/app/models/portion.model';
import { DiaryService } from 'src/app/services/diary.service';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { MapperService } from 'src/app/services/mapper.service';
import { QuantityEditorComponent } from 'src/app/ui/quantity-editor/quantity-editor.component';

@Component({
  selector: 'app-edit-portion',
  templateUrl: './edit-portion.component.html',
  styleUrls: ['./edit-portion.component.css']
})
export class EditPortionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription;

  public originalPortion: Portion;

  private _previewedPortion: Portion;

  public set previewedPortion(value) {
    this._previewedPortion = value;
  }

  public get previewedPortion(): Portion {
    return this._previewedPortion;
  }

  @ViewChildren(QuantityEditorComponent)
  private quantityEditorsList: QueryList<QuantityEditorComponent>;

  private quantityEditor: QuantityEditorComponent;

  public mealSelector = new FormControl();

  // tk public accessor only
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

    const id = +this.route.snapshot.paramMap.get('portionId');

    this.subscription = this.ds.diary$.subscribe(diary => {
      if (diary === undefined) {
        return;
      }
      this.originalPortion = diary.getPortion(id);
      if (this.originalPortion === undefined) {
        return;
      }

      this.diary = diary;

      this.previewedPortion = this.originalPortion;

      this.mealSelector.setValue(this.originalPortion.meal);
    });
  }

  ngAfterViewInit(): void {
    if (this.quantityEditorsList && this.quantityEditorsList.first) {
      this.setupQuantityEditor(this.quantityEditorsList.first);
    } else {
      // the quantity editor isn't loaded so wait until it is
      this.quantityEditorsList.changes.subscribe(list => {
        if (list.length) {
          this.setupQuantityEditor(list.first);
        }
      });
    }

    this.subscription.add(
      this.mealSelector.valueChanges.subscribe((value: number) => {
        if (value !== this.previewedPortion.meal) {
          this.previewedPortion = new Portion(
            this.previewedPortion.id,
            this.previewedPortion.quantity,
            this.previewedPortion.food,
            value
          );
        }
      })
    );
  }

  private setupQuantityEditor(editor: QuantityEditorComponent): void {
    // prevents the action buttons throwing an `expression changed after it was checked`
    setTimeout(() => {
      this.quantityEditor = editor;
      this.quantityEditor.valueChanges.subscribe((value: number) => {
        if (value !== this.previewedPortion.quantity) {
          this.previewedPortion = new Portion(
            this.previewedPortion.id,
            value,
            this.previewedPortion.food,
            this.previewedPortion.meal
          );
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get saveDisabled(): boolean {
    if (!this.quantityEditor) {
      return false;
    }
    return !this.quantityEditor.valid || !this.mealSelector.valid || this.portionUnchanged;
  }

  get portionUnchanged(): boolean {
    return (
      this.originalPortion.quantity === this.previewedPortion.quantity &&
      this.originalPortion.meal === this.previewedPortion.meal
    );
  }

  public back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  public reset(): void {
    this.quantityEditor.reset(this.originalPortion.quantity);
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
        this.ui.notifyRemovedPortion(deletedPortion.food.name, () => {
          this.ds.addPortion(MapperService.toDto(deletedPortion)).subscribe(() => {
            this.ui.notifyRestorePortion(deletedPortion.food.name);
          });
        });
        this.back();
      },
      error: () => this.ui.warnFailedRemoval(deletedPortion.id)
    });
  }

  // tk bad; shouldn't check for quantity edit
  private checkPreview(preview: string): string {
    if (this.quantityEditor && this.quantityEditor.valid) {
      return preview;
    }
    return '…';
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
}
