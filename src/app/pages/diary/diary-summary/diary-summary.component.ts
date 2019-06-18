import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { DiaryService } from 'src/app/services/diary.service';
import { ShortDate } from 'src/app/models/date-ymd.model';
import { DiaryEntryDto } from 'src/app/models/diary-entry-dto.model';

@Component({
  selector: 'app-diary-summary',
  templateUrl: './diary-summary.component.html',
  styleUrls: ['./diary-summary.component.css']
})
export class DiarySummaryComponent implements OnInit, OnDestroy {
  public focus: string;

  public columns: ReadonlyArray<string> = ['Calories', 'Macronutrients'];
  public columnSelector = new FormControl();

  public get diary$(): BehaviorSubject<Diary | undefined> {
    return this.ds.diary$;
  }

  private subscription: Subscription = new Subscription();

  constructor(
    readonly ds: DiaryService,
    public ui: UiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // sets up the colums selector and specify a default value
    this.subscription.add(
      this.columnSelector.valueChanges.subscribe(value => (this.focus = value))
    );
    this.columnSelector.setValue(this.columns[0]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public sendtest() {
    // this.ds
    //   .addPortion(new ShortDate(2019, 6, 13), {
    //     foodId: 2,
    //     mealNumber: 1,
    //     quantity: 150
    //   })
    //   .subscribe(
    //     whatever => {
    //       console.log(whatever);
    //     },
    //     error => console.log(error)
    //   );
  }

  public get hasContents(): boolean {
    return this.diary$.value && this.diary$.value.hasContents;
  }

  public addMeal() {
    this.router.navigate(['add-portion'], { relativeTo: this.route });
  }

  public deleteAll(): void {
    // this.ds.deleteDay().then(result => {
    //   if (result === null) {
    //     this.ui.warn(
    //       `Couldn't delete ${this.date.toLocaleDateString()}'s entries`
    //     );
    //   } else {
    //     this.ui.notify(
    //       `Deleted ${this.date.toLocaleDateString()}'s entries`,
    //       'Undo',
    //       () => {
    //         this.ds.restoreDay(result);
    //         this.ui.warn(
    //           `Restored ${this.date.toLocaleDateString()}'s entries`
    //         );
    //       }
    //     );
    //   }
    // });
  }
}
