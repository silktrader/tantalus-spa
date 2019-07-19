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

  private subscription: Subscription = new Subscription();

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

  public get date(): Date {
    return this.ds.date;
  }

  public addMeal() {
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
        console.log(message);
      }
    });
  }
}
