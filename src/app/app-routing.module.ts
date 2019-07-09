import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { FoodsComponent } from './pages/foods/foods.component';
import { EditFoodComponent } from './pages/edit-food/edit-food.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { DiarySummaryComponent } from './pages/diary/diary-summary/diary-summary.component';
import { AddPortionComponent } from './pages/diary/add-portion/add-portion.component';
import { SelectPortionComponent } from './pages/diary/select-portion/select-portion.component';
import { EditPortionComponent } from './pages/diary/edit-portion/edit-portion.component';
import { RecipesSummaryComponent } from './pages/recipes/recipe-summary/recipes-summary.component';
import { EditRecipeComponent } from './pages/recipes/edit-recipe/edit-recipe.component';
import { AddRecipePortionsComponent } from './pages/recipes/add-recipe-portions/add-recipe-portions.component';

const routes: Routes = [
  { path: 'login', component: AuthenticationComponent },
  { path: 'register', component: AuthenticationComponent },
  {
    path: 'diary/:date',
    component: DiaryComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DiarySummaryComponent },
      { path: 'add-portion', component: SelectPortionComponent },
      { path: 'add-portion/:foodID', component: AddPortionComponent },
      { path: 'add-recipe', component: AddRecipePortionsComponent },
      { path: ':portionId', component: EditPortionComponent }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'foods',
    component: FoodsComponent,
    canActivate: [AuthGuard]
  },
  { path: 'add-food', component: EditFoodComponent, canActivate: [AuthGuard] },
  {
    path: 'foods/:id',
    component: EditFoodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'recipes',
    component: RecipesSummaryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'recipes/:id',
    component: EditRecipeComponent,
    canActivate: [AuthGuard]
  }
  // { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  // onSameUrlNavigation allows pages refresh when lacking live connections
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
