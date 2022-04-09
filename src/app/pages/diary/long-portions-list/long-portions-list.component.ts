import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import {
  SettingsService,
  ISummarySettings,
} from "src/app/services/settings.service";
import { Diary } from "src/app/models/diary.model";
import { DiaryService } from "src/app/services/diary.service";
import { MatDialog } from "@angular/material/dialog";
import { Portion } from "src/app/models/portion.model";
import { EditPortionDialogComponent } from "../edit-portion-dialog/edit-portion-dialog.component";
import { UiService } from "src/app/services/ui.service";
import { AddPortionDialogComponent } from "../add-portion-dialog/add-portion-dialog.component";
import { FoodsService } from "src/app/services/foods.service";
import {
  ChartService,
  MacronutrientsChartData,
} from "src/app/services/chart.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-long-portions-list",
  templateUrl: "./long-portions-list.component.html",
  styleUrls: ["./long-portions-list.component.css"],
})
export class LongPortionsListComponent implements OnInit, OnDestroy {
  public diary: Diary;
  public chartData: MacronutrientsChartData;
  public focusedSet: number;
  public settings: ISummarySettings;

  public subscription = new Subscription();
  public columnSelector = new FormControl();

  public get columnSet() {
    return SettingsService.largeColumnSet;
  }

  @Output() deletePortionsEvent = new EventEmitter<ReadonlyArray<Portion>>();

  constructor(
    private ds: DiaryService,
    private cs: ChartService,
    private ui: UiService,
    private fs: FoodsService,
    private dialog: MatDialog,
    private ss: SettingsService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.ds.diary$.subscribe((diary) => {
        this.diary = diary;

        // tk check: not working
        // if (diary) {
        //   this.chartData = this.cs.macronutrientsData(diary);
        //   console.log(this.chartData);
        // }
      })
    );

    this.columnSelector.valueChanges.subscribe(
      (value) => (this.focusedSet = value)
    );

    this.subscription.add(
      this.ss.summary$.subscribe((settings) => {
        this.settings = settings;
        this.columnSelector.setValue(settings.largeColumnSet);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public addPortion(meal?: number) {
    this.dialog.open(AddPortionDialogComponent, {
      data: { ds: this.ds, ui: this.ui, fs: this.fs, meal },
    });
  }

  public editPortion(portion: Portion) {
    this.dialog.open(EditPortionDialogComponent, {
      data: { portion, ds: this.ds, ui: this.ui },
    });
  }

  public deletePortions(portions: ReadonlyArray<Portion>) {
    this.deletePortionsEvent.next(portions);
  }
}
