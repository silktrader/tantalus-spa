import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Diary } from 'src/app/models/diary.model';
import { SettingsService, ISummarySettings } from 'src/app/services/settings.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DiaryService } from 'src/app/services/diary.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Meal, Portion } from 'src/app/models/portion.model';

@Component({
  selector: 'app-short-portions-list',
  templateUrl: './short-portions-list.component.html',
  styleUrls: ['./short-portions-list.component.css']
})
export class ShortPortionsListComponent implements OnInit {
  public diary: Diary;
  public subscription = new Subscription();
  public columnSelector = new FormControl();
  public focusedSet: number;
  public settings: ISummarySettings;

  public proteinsChartData;

  @Output() deletePortionsEvent = new EventEmitter<ReadonlyArray<Portion>>();

  public get columnSet() {
    return SettingsService.smallColumnSet;
  }

  constructor(
    private ss: SettingsService,
    private ds: DiaryService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.ds.diary$.subscribe(diary => {
        this.diary = diary;
      })
    );

    this.columnSelector.valueChanges.subscribe(value => {
      this.focusedSet = value;
    });

    this.subscription.add(
      this.ss.summary$.subscribe(settings => {
        this.settings = settings;
        this.columnSelector.setValue(settings.largeColumnSet);
      })
    );
  }

  public addPortion(meal?: string) {
    this.router.navigate(['add-portion'], { relativeTo: this.route, state: { meal } });
  }

  public editPortion(portion: Portion) {
    this.router.navigate([portion.id], { relativeTo: this.route });
  }

  public deletePortions(portions: ReadonlyArray<Portion>) {
    this.deletePortionsEvent.next(portions);
  }
}
