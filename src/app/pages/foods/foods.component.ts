import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Food } from '../../models/food.model';
import { FoodProp } from '../../models/food-prop.model';
import { Subscription, of, fromEvent, merge } from 'rxjs';
import { map, debounceTime, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { FormControl } from '@angular/forms';
import { FoodsService } from 'src/app/services/foods.service';
import { ToolbarComponent } from 'src/app/ui/toolbar/toolbar.component';
import { FoodsDataSource } from './foods-data-source';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css']
})
export class FoodsComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private fs: FoodsService,
    public ui: UiService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) { }

  public selectedColumns: Array<FoodProp> = new Array<FoodProp>();

  public readonly mobileColumnSets = new Map<string, Array<FoodProp>>([
    ['Overview', [FoodProp.detailsPercentage, FoodProp.calories]],
    ['Macronutrients', [FoodProp.proteins, FoodProp.carbs, FoodProp.fats]]
  ]);

  private readonly desktopColumnSets = new Map<string, Array<FoodProp>>([
    [
      'Overview',
      [
        FoodProp.detailsPercentage,
        FoodProp.proteins,
        FoodProp.carbs,
        FoodProp.fats,
        FoodProp.calories
      ]
    ],
    [
      'Carbohydrates',
      [FoodProp.carbs, FoodProp.starch, FoodProp.fibres, FoodProp.sugar, FoodProp.carbsPercentage]
    ],
    [
      'Fats',
      [
        FoodProp.fats,
        FoodProp.saturated,
        FoodProp.trans,
        FoodProp.cholesterol,
        FoodProp.fatsPercentage
      ]
    ],
    [
      'Minerals',
      [
        FoodProp.sodium,
        FoodProp.potassium,
        FoodProp.magnesium,
        FoodProp.iron,
        FoodProp.zinc,
        FoodProp.calcium
      ]
    ]
  ]);

  public readonly columnNames = new Map<string, string>([
    [FoodProp.name, 'Name'],
    [FoodProp.calories, 'Calories'],
    [FoodProp.proteins, 'Proteins'],
    [FoodProp.carbs, 'Carbs'],
    [FoodProp.fats, 'Fats'],
    [FoodProp.fibres, 'Fibres'],
    [FoodProp.sugar, 'Sugar'],
    [FoodProp.starch, 'Starch'],
    [FoodProp.carbsPercentage, 'Carbs %'],
    [FoodProp.fatsPercentage, 'Fats %'],
    [FoodProp.proteinsPercentage, 'Proteins %'],
    [FoodProp.detailsPercentage, 'Details %'],
    [FoodProp.cholesterol, 'Cholesterol'],
    [FoodProp.saturated, 'Saturated'],
    [FoodProp.trans, 'Trans'],
    [FoodProp.sodium, 'Sodium'],
    [FoodProp.potassium, 'Potassium'],
    [FoodProp.calcium, 'Calcium'],
    [FoodProp.magnesium, 'Magnesium'],
    [FoodProp.zinc, 'Zinc'],
    [FoodProp.iron, 'Iron']
  ]);

  public columnSelector = new FormControl();
  public nameFilter = new FormControl();

  @ViewChild(MatButtonToggleGroup) public columnToggle: MatButtonToggleGroup;

  private subscription = new Subscription();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild('tableControls', { static: true }) tableControls: ElementRef;
  @ViewChild(ToolbarComponent, { static: true }) toolbar: ToolbarComponent;

  private readonly integerProperties = new Set([
    FoodProp.calories,
    FoodProp.proteins,
    FoodProp.carbs,
    FoodProp.fats
  ]);
  private readonly oneDecimalProperties: Set<FoodProp> = new Set([FoodProp.fibres, FoodProp.sugar]);
  private readonly percentageProperties = new Set([
    FoodProp.proteinsPercentage,
    FoodProp.carbsPercentage,
    FoodProp.fatsPercentage,
    FoodProp.detailsPercentage
  ]);

  public desktop = false;

  // tk use dep injection?
  public readonly datasource = new FoodsDataSource(this.fs);

  public pageSizeOptions = [10, 15, 30];

  ngOnInit(): void {
    this.subscription.add(
      this.ui.mobile
        .pipe(switchMap(isMobile => (isMobile ? this.columnSelector.valueChanges : of(undefined))))
        .subscribe(value => {
          if (value === undefined) {
            return;
          }
          this.selectedColumns = this.selectMobileColumns(value);
        })
    );

    this.subscription.add(
      this.ui.desktop
        .pipe(
          switchMap(isDesktop => {
            if (!isDesktop) {
              this.desktop = false;
              return of(undefined);
            }

            this.desktop = true;
            this.changeDetector.detectChanges();
            this.columnToggle.value = 'Overview';
            this.selectedColumns = this.selectDesktopColumns(this.columnToggle.value);
            return this.columnToggle.valueChange.asObservable();
          })
        )
        .subscribe(value => {
          if (value === undefined) {
            return;
          }
          this.selectedColumns = this.selectDesktopColumns(value);
        })
    );

    this.columnSelector.setValue('Calories');

    // final call to populate the table and set the loading state
    this.datasource.loadFoods(0, this.pageSizeOptions[1], 'name', true, undefined);
  }

  ngAfterViewInit(): void {
    this.nameFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadFoods();
        })
      )
      .subscribe();

    merge(this.paginator.page, this.sort.sortChange)
      .pipe(
        tap(() => this.loadFoods())
      )
      .subscribe();

    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    // listen to height changes
    const $resizeEvent = fromEvent(window, 'resize').pipe(
      map(() => {
        if (document && document.documentElement) {
          return document.documentElement.clientHeight;
        }
        return 800;
      }),
      debounceTime(200)
    );

    // possibly unnecessary subscription registration
    this.subscription.add(
      $resizeEvent.subscribe((data: number) => {
        this.paginator._changePageSize(this.calculateRowsNumber(data));
      })
    );

    // set the initial page size
    if (document && document.documentElement) {
      this.paginator.pageSize = this.calculateRowsNumber(document.documentElement.clientHeight);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadFoods(): void {
    this.datasource.loadFoods(
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction === 'asc',
      this.nameFilter.value
    );
  }

  edit(food: Food): void {
    this.router.navigate(['/foods', food.shortUrl]);
  }

  public format(prop: FoodProp, item: any): string {
    if (typeof item === 'number') {
      if (this.integerProperties.has(prop)) {
        return item.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }

      if (this.oneDecimalProperties.has(prop)) {
        return item.toLocaleString(undefined, { maximumFractionDigits: 1 });
      }

      if (this.percentageProperties.has(prop)) {
        return item.toLocaleString(undefined, { style: 'percent' });
      }
    }

    if (typeof item === 'undefined') {
      return '∅';
    }

    return item;
  }

  private selectMobileColumns(key: string): Array<FoodProp> {
    return [FoodProp.name, ...(this.mobileColumnSets.get(key) || [])];
  }

  public selectDesktopColumns(key: string): Array<FoodProp> {
    return [FoodProp.name, ...(this.desktopColumnSets.get(key) || [])];
  }

  private calculateRowsNumber(availableHeight: number): number {
    // less than ideal calculations due to tight coupling with rendering layer
    const tableControlsHeight = (this.tableControls.nativeElement as HTMLElement).offsetHeight;
    const toolbarHeight = 50;
    const headerHeight = 56;
    const rowHeight = 50;
    const paginatorHeight = 56;
    return Math.floor(
      (availableHeight - tableControlsHeight - toolbarHeight - headerHeight - paginatorHeight) /
      rowHeight
    );
  }
}
