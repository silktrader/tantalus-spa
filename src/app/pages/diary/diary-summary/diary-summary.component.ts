import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
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

enum ViewType {
  large = 1,
  small = 2
}

@Component({
  selector: 'app-diary-summary',
  templateUrl: './diary-summary.component.html',
  styleUrls: ['./diary-summary.component.css']
})
export class DiarySummaryComponent implements OnInit, OnDestroy {
  public viewType = ViewType;

  public diary: Diary;

  public readonly dateInput = new FormControl();

  private readonly subscription: Subscription = new Subscription();

  public loading = true;
  public settings: ISummarySettings = undefined;

  public view: ViewType;

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

        // populate chart data, tk here? what about mobile?
        this.loading = false;
      })
    );

    // read display settings before all other operations
    this.ss.summary$.subscribe(settings => {
      this.settings = settings;

      // subscribe to breakpoint notifiers only once settings are read
      this.subscription.add(
        this.ui.desktop.subscribe(isDesktop => {
          if (isDesktop) {
            this.view = ViewType.large;
          }
        })
      );

      this.subscription.add(
        this.ui.mobile.subscribe(isMobile => {
          if (isMobile) {
            this.view = ViewType.small;
          }
        })
      );
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

  public get date(): Date {
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

  // public editComment() {
  //   this.ds
  //     .editComment(this.commentTextarea.value)
  //     .subscribe(
  //       () => this.ui.notify(`Edited comment`),
  //       error => this.ui.notify(`Couldn't edit comment ${error}`)
  //     );
  // }
}
