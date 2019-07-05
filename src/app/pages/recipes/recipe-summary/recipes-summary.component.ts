import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipesDataSource } from '../recipes-data-source';
import { RecipesService } from 'src/app/services/recipes.service';
import { UiService } from 'src/app/services/ui.service';
import { MatPaginator } from '@angular/material';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-recipes-summary',
  templateUrl: './recipes-summary.component.html',
  styleUrls: ['./recipes-summary.component.css']
})
export class RecipesSummaryComponent implements OnInit, AfterViewInit {
  dataSource: RecipesDataSource;
  selectedColumns = ['name'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private rs: RecipesService,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.dataSource = new RecipesDataSource(this.rs, this.ui);
    this.dataSource.loadRecipes(0, 10);
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() =>
          this.dataSource.loadRecipes(
            this.paginator.pageIndex,
            this.paginator.pageSize
          )
        )
      )
      .subscribe();
  }

  public addNewRecipe(): void {
    this.router.navigate(['/add-recipes']);
  }
}
