import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { RecipeDto } from 'src/app/models/recipe-autocomplete.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { RecipesService } from 'src/app/services/recipes.service';
import { catchError, finalize } from 'rxjs/operators';
import { UiService } from 'src/app/services/ui.service';
import { RecipesPaginationDto } from 'src/app/models/recipes-pagination.model';

export class RecipesDataSource implements DataSource<RecipeDto> {
  private recipesSubject = new BehaviorSubject<RecipeDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  private count = 0;
  public get recipesCount(): number {
    return this.count;
  }

  constructor(private rs: RecipesService, private ui: UiService) {}

  connect(collectionViewer: CollectionViewer): Observable<RecipeDto[]> {
    return this.recipesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.recipesSubject.complete();
    this.loadingSubject.complete();
  }

  loadRecipes(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    this.rs
      .findRecipes(pageIndex, pageSize)
      .pipe(
        catchError(error => {
          this.ui.warn(error);
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((response: RecipesPaginationDto) => {
        this.recipesSubject.next(response.recipes);
        this.count = response.recipesCount;
      });
  }
}
