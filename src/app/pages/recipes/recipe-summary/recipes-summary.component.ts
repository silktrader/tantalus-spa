import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipes-summary',
  templateUrl: './recipes-summary.component.html',
  styleUrls: ['./recipes-summary.component.css']
})
export class RecipesSummaryComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  public addNewRecipe(): void {
    this.router.navigate(['/add-recipes']);
  }
}
