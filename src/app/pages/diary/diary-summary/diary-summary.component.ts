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

  private isDesktopField: boolean;
  public get isDesktop(): boolean {
    return this.isDesktopField;
  }

  private isMobileField: boolean;
  public get isMobile(): boolean {
    return this.isMobileField;
  }

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
    public ui: UiService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.ds.diary$.subscribe(diary => {
        this.diary = diary;

        if (diary === undefined) {
          return;
        }

        this.commentTextarea.reset(diary.comment);

        // populate chart data, tk here? what about mobile?
        this.macroChartsData = this.fetchMacroChartData();
      })
    );

    this.subscription.add(this.ui.mobile.subscribe(value => (this.isMobileField = value)));
    this.subscription.add(this.ui.desktop.subscribe(value => (this.isDesktopField = value)));

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
      data[0] = meal.getTotalProperty('proteins');
      data[1] = meal.getTotalProperty('carbs');
      data[2] = meal.getTotalProperty('fats');
    }
    return data;
  }

  public get date(): Date {
    return this.ds.date;
  }

  public addPortion() {
    this.router.navigate(['add-portion'], { relativeTo: this.route });
  }

  /**
   * Choose how to edit a portion; either with a modal or full screen dialogues.
   * @param portion The exiting portion that will be replaced
   */
  public editPortion(portion: Portion) {
    const subscription = this.ui.desktop.subscribe(isDesktop => {
      if (isDesktop) {
        this.dialog.open(EditPortionDialogComponent, {
          data: { portion, ds: this.ds, ui: this.ui }
        });
      } else {
        this.router.navigate([portion.id], { relativeTo: this.route });
      }
    });
    subscription.unsubscribe();
  }

  public deleteAll(): void {
    const date = this.ds.date;
    const cachedDto = this.diary.dto;
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

  public editComment() {
    this.ds.editComment(this.commentTextarea.value).subscribe({
      next: () => {
        this.ui.notify(`Edited comment`);
      },
      error: error => {
        this.ui.notify(`Couldn't edit comment ${error}`);
      }
    });
  }
}
