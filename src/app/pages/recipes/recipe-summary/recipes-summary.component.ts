import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipesDataSource } from '../recipes-data-source';
import { RecipesService } from 'src/app/services/recipes.service';
import { UiService } from 'src/app/services/ui.service';
import { MatPaginator } from '@angular/material';

@Component({
  selector: 'app-recipes-summary',
  templateUrl: './recipes-summary.component.html',
  styleUrls: ['./recipes-summary.component.css']
})
export class RecipesSummaryComponent implements OnInit, AfterViewInit {
  dataSource: RecipesDataSource;
  selectedColumns = ['name', 'ingredientsCount', 'calories'];

  pageSizeOptions = [3, 20, 30];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private rs: RecipesService,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.dataSource = new RecipesDataSource(this.rs, this.ui);
    this.dataSource.loadRecipes(0, this.pageSizeOptions[0]);
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.dataSource.loadRecipes(
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
    });
  }

  public addNewRecipe(): void {
    this.router.navigate(['/add-recipes']);
  }
}
