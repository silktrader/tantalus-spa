import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { DiaryService } from 'src/app/services/diary.service';
import { EditPortionDialogComponent } from '../edit-portion-dialog/edit-portion-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Portion } from 'src/app/models/portion.model';
import { ChartOptions } from 'chart.js';
import { AddPortionDialogComponent } from '../add-portion-dialog/add-portion-dialog.component';
import { FoodsService } from 'src/app/services/foods.service';
import { Meal } from 'src/app/models/meal.model';
import { PortionDto } from 'src/app/models/portion-dto.model';
import { PortionAdapter } from 'src/app/services/diary-adapter';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';

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

  private readonly subscription: Subscription = new Subscription();

  // tk create chart details class
  public readonly macroChartsOptions: Readonly<ChartOptions> = {
    responsive: false,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        fontFamily: '\'Roboto\', \'sans-serif\'',
        usePointStyle: true
      }
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        }
      }
    }
  };

  public macroChartsData: Array<number> = [];
  public macroChartsLabels: Array<string> = ['Proteins', 'Carbs', 'Fats'];

  constructor(
    private ds: DiaryService,
    private fs: FoodsService,
    public ui: UiService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private portionAdapter: PortionAdapter
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.ds.diary$.subscribe(diary => {
        this.diary = diary;

        if (diary === undefined) {
          this.commentTextarea.reset();
          return;
        }

        this.commentTextarea.reset(diary.comment);

        // populate chart data, tk here? what about mobile?
        this.macroChartsData = this.fetchMacroChartData();
      })
    );

    // sets up the colums selector and specify a default value
    this.subscription.add(
      this.columnSelector.valueChanges.subscribe(value => (this.focus = value))
    );
    this.columnSelector.setValue(this.columns[0]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private fetchMacroChartData(): Array<number> {
    const data = [0, 0, 0];
    for (const meal of this.diary.meals) {
      data[0] += meal.getTotalProperty('proteins');
      data[1] += meal.getTotalProperty('carbs');
      data[2] += meal.getTotalProperty('fats');
    }
    return data;
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
      error: message => {
        this.ui.warn(`Couldn't delete ${this.date.toLocaleDateString()}'s entries`);
      }
    });
  }

  public deleteMealPortions(meal: Meal): void {
    const ids: Array<number> = [];
    const restoreDtos: Array<PortionAddDto> = [];

    // create dtos of portions
    for (const portion of meal.Portions) {
      ids.push(portion.id);
      restoreDtos.push(this.portionAdapter.toAddTo(portion));
    }

    this.ds.removePortions(ids).subscribe(() => {
      this.ui.notifyRemovedPortions(ids.length, () => {
        this.ds.addPortions(restoreDtos).subscribe();
      });
    });
  }

  public editComment() {
    this.ds.editComment(this.commentTextarea.value).subscribe({
      next: () => {
        this.ui.notify(`Edited comment`);
      },
      error: error => {
        console.log(error);
        this.ui.notify(`Couldn't edit comment ${error}`);
      }
    });
  }
}
