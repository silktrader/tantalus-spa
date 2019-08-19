import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { DiaryService } from 'src/app/services/diary.service';
import { EditPortionDialogComponent } from '../edit-portion-dialog/edit-portion-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Portion } from 'src/app/models/portion.model';
import { AddPortionDialogComponent } from '../add-portion-dialog/add-portion-dialog.component';
import { FoodsService } from 'src/app/services/foods.service';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';
import { DtoMapper } from 'src/app/services/dto-mapper';
import { FoodProp } from 'src/app/models/food-prop.model';

export interface NgxChartEntry {
  name: string;
  value: number;
}

@Component({
  selector: 'app-diary-summary',
  templateUrl: './diary-summary.component.html',
  styleUrls: ['./diary-summary.component.css']
})
export class DiarySummaryComponent implements OnInit, OnDestroy {
  public focus: string;
  public diary: Diary;

  public columns: ReadonlyArray<string> = ['Calories', 'Macronutrients'];
  public columnSelector = new FormControl();
  public readonly commentTextarea = new FormControl();
  public readonly dateInput = new FormControl();

  private readonly subscription: Subscription = new Subscription();

  public macroData: {
    grams: ReadonlyArray<NgxChartEntry>;
    calories: ReadonlyArray<NgxChartEntry>;
    meals: ReadonlyArray<NgxChartEntry>;
  } = { grams: [], calories: [], meals: [] };

  constructor(
    private ds: DiaryService,
    private fs: FoodsService,
    public ui: UiService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private mapper: DtoMapper
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.ds.diary$.subscribe(diary => {
        this.diary = diary;
        this.dateInput.setValue(this.ds.date);

        if (diary === undefined) {
          this.commentTextarea.reset();
          return;
        }

        this.commentTextarea.reset(diary.comment);

        // populate chart data, tk here? what about mobile?
        this.macroData = this.calculateMacroChart();
      })
    );

    // sets up the colums selector and specify a default value
    this.subscription.add(
      this.columnSelector.valueChanges.subscribe(value => (this.focus = value))
    );
    this.columnSelector.setValue(this.columns[0]);

    this.dateInput.valueChanges.subscribe((date: Date) => {
      if (date !== this.ds.date) {
        this.ui.goToDate(date);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public get date(): Date {
    return this.ds.date;
  }

  public addPortion(meal?: number) {
    if (this.ui.isMobile) {
      this.router.navigate(['add-portion'], { relativeTo: this.route, state: { meal } });
    } else {
      this.dialog.open(AddPortionDialogComponent, {
        data: { ds: this.ds, ui: this.ui, fs: this.fs, meal }
      });
    }
  }

  /**
   * Choose how to edit a portion; either with a modal or full screen dialogues.
   * @param portion The exiting portion that will be replaced
   */
  public editPortion(portion: Portion) {
    if (this.ui.isMobile) {
      this.router.navigate([portion.id], { relativeTo: this.route });
    } else {
      this.dialog.open(EditPortionDialogComponent, {
        data: { portion, ds: this.ds, ui: this.ui }
      });
    }
  }

  public deleteAll(): void {
    const date = this.ds.date;
    const cachedDto = this.ds.state;
    this.ds.deleteDiary().subscribe({
      next: () => {
        this.ui.notify(`Deleted ${date.toLocaleDateString()}'s entries`, `Undo`, () => {
          this.ds
            .restoreDiary(cachedDto)
            .subscribe(
              () => this.ui.notify(`Restored ${date.toLocaleDateString()}'s entries`),
              error => this.ui.warn(`Couldn't restore ${date.toLocaleDateString()}'s entries`)
            );
        });
      },
      error: () => {
        this.ui.warn(`Couldn't delete ${this.date.toLocaleDateString()}'s entries`);
      }
    });
  }

  public deletePortions(portions: ReadonlyArray<Portion>): void {
    const ids: Array<number> = [];
    const restoreDtos: Array<PortionAddDto> = [];

    // create dtos of portions
    for (const portion of portions) {
      ids.push(portion.id);
      restoreDtos.push(this.mapper.mapPortionAddDto(portion));
    }

    this.ds.removePortions(ids).subscribe(
      () => {
        this.ui.notifyRemovedPortions(ids.length, () => {
          this.ds.addPortions(restoreDtos).subscribe();
        });
      },
      () => {
        this.ui.warnFailedRemovals(ids);
      }
    );
  }

  public editComment() {
    this.ds
      .editComment(this.commentTextarea.value)
      .subscribe(
        () => this.ui.notify(`Edited comment`),
        error => this.ui.notify(`Couldn't edit comment ${error}`)
      );
  }

  private calculateMacroChart(): {
    grams: Array<NgxChartEntry>;
    calories: Array<NgxChartEntry>;
    meals: Array<NgxChartEntry>;
  } {
    const gramsData: Array<NgxChartEntry> = [];
    const caloriesData: Array<NgxChartEntry> = [];
    const mealsData: Array<NgxChartEntry> = [];

    for (const kvp of Diary.mealTypes) {
      mealsData.push({ name: kvp[1], value: kvp[0] });
    }

    // establish relevant macronutrients
    const macros = [FoodProp.proteins, FoodProp.carbs, FoodProp.fats, FoodProp.alcohol];
    const kcalMultipliers = [4, 4, 9, 7];

    // initialise the data arrays
    for (const macro of macros) {
      gramsData.push({ name: macro, value: 0 });
      caloriesData.push({ name: macro, value: 0 });
    }

    // establish macronutrients aggregates in grams
    for (let meal = 0; meal < this.diary.meals.size; meal++) {
      let totalCalories = 0;
      for (const portion of this.diary.meals.get(meal)) {
        for (let m = 0; m < macros.length; m++) {
          const grams = portion.getTotalProperty(macros[m]);
          gramsData[m].value += grams;

          const calories = grams * kcalMultipliers[m];
          caloriesData[m].value += calories;
          totalCalories += calories;
        }
      }
      mealsData[meal].value = totalCalories;
    }

    // compute calories aggregates
    for (let m = 0; m < macros.length; m++) {
      caloriesData[m].value = gramsData[m].value * kcalMultipliers[m];
    }

    return { grams: gramsData, calories: caloriesData, meals: mealsData };
  }
}
