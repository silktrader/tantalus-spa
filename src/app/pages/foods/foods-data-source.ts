import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FoodsService } from 'src/app/services/foods.service';
import { Food } from 'src/app/models/food.model';

export class FoodsDataSource implements DataSource<Food> {
  private foodsSubject = new BehaviorSubject<Food[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  private count = 0;
  public get foodsCount(): number {
    return this.count;
  }

  constructor(private fs: FoodsService) {}

  connect(collectionViewer: CollectionViewer): Observable<Food[]> {
    return this.foodsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.foodsSubject.complete();
    this.loadingSubject.complete();
  }

  public loadFoods(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    this.fs
      .getPaginatedFoods(pageIndex, pageSize)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe(response => {
        console.log(response);
        this.foodsSubject.next(response.foods.map(dto => new Food(dto)));
        this.count = response.count;
      });
  }
}
