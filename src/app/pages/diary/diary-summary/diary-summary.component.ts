import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { DiaryService } from 'src/app/services/diary.service';

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
    private route: ActivatedRoute
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

  public deleteAll(): void {
    const date = this.ds.date;
    const cachedDto = this.diary.dto;
    this.ds.deleteDiary().subscribe({
      next: () => {
        this.ui.notify(
          `Deleted ${date.toLocaleDateString()}'s entries`,
          `Undo`,
          () => {
            this.ds
              .restoreDiary(cachedDto)
              .subscribe(
                () =>
                  this.ui.notify(
                    `Restored ${date.toLocaleDateString()}'s entries`
                  ),
                error =>
                  this.ui.warn(
                    `Couldn't restore ${date.toLocaleDateString()}'s entries`
                  )
              );
          }
        );
      },
      error: message => {
        this.ui.warn(
          `Couldn't delete ${this.date.toLocaleDateString()}'s entries`
        );
        console.log(message);
      }
    });
  }
}
