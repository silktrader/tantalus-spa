import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { UiService } from 'src/app/services/ui.service';
import { Diary } from 'src/app/models/diary.model';
import { DiaryService } from 'src/app/services/diary.service';
import { Portion } from 'src/app/models/portion.model';
import { PortionAddDto } from 'src/app/models/portion-add-dto.model';
import { DtoMapper } from 'src/app/services/dto-mapper';
import { SettingsService, ISummarySettings } from 'src/app/services/settings.service';
import { AddPortionDialogComponent } from '../add-portion-dialog/add-portion-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-diary-summary',
  templateUrl: './diary-summary.component.html',
  styleUrls: ['./diary-summary.component.scss']
})
export class DiarySummaryComponent implements OnInit, OnDestroy {

  public diary: Diary;

  public readonly dateInput = new FormControl();

  readonly moodFitnessForm = new FormGroup({
    mood: new FormControl(),
    fitness: new FormControl()
  });

  private readonly subscription: Subscription = new Subscription();

  public loading = true;
  public settings: ISummarySettings = undefined;

  mood: number;
  fitness: number;

  constructor(
    private ds: DiaryService,
    private ui: UiService,
    private ss: SettingsService,
    private mapper: DtoMapper,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.ds.diary$.subscribe(diary => {
        this.loading = true;
        this.diary = diary;
        this.dateInput.setValue(this.ds.date);

        // handle undefined diary with no ratings
        this.mood = diary?.mood ?? 0;
        this.fitness = diary?.fitness ?? 0;

        this.loading = false;
      })
    );

    // read display settings before all other operations
    this.ss.summary$.subscribe(settings => {
      this.settings = settings;
    });

    this.dateInput.valueChanges.subscribe((date: Date) => {
      if (date !== this.ds.date) {
        this.ui.goToDate(date);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get date(): Date {
    return this.ds.date;
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
    const ids: Array<string> = [];
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

  public addPortion(meal?: number) {
    if (this.ui.isMobile) {
      this.router.navigate(['add-portion'], { relativeTo: this.route, state: { meal } });
    } else {
      this.dialog.open(AddPortionDialogComponent, {
        data: { ds: this.ds, meal }
      });
    }
  }

  updateMood(mood: number) {
    this.ds.updateMood(mood).subscribe({
      next: () => this.ui.notify(`Rated daily mood as ${mood} out of 5`),
      error: () => {
        this.ui.warn('Error while rating mood; reverting to previous value');
        this.mood = this.diary.mood;        // the diary won't have changed on error
      }
    });
  }

  updateFitness(fitness: number) {
    this.ds.updateFitness(fitness).subscribe({
      next: () => this.ui.notify(`Rated daily fitness as ${fitness} out of 5`),
      error: () => {
        this.ui.warn('Error while rating fitness; reverting to previous value');
        this.fitness = this.diary.fitness;        // the diary won't have changed on error
      }
    });
  }

  // public editComment() {
  //   this.ds
  //     .editComment(this.commentTextarea.value)
  //     .subscribe(
  //       () => this.ui.notify(`Edited comment`),
  //       error => this.ui.notify(`Couldn't edit comment ${error}`)
  //     );
  // }
}
