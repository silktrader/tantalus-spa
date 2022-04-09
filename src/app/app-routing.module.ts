import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { FoodsComponent } from './pages/foods/foods.component';
import { EditFoodComponent } from './pages/edit-food/edit-food.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { DiarySummaryComponent } from './pages/diary/diary-summary/diary-summary.component';
import { EditPortionFullscreenComponent } from './pages/diary/edit-portion-fullscreen/edit-portion-fullscreen.component';
import { SelectPortionComponent } from './pages/diary/select-portion/select-portion.component';
import { RecipesSummaryComponent } from './pages/recipes/recipe-summary/recipes-summary.component';
import { EditRecipeComponent } from './pages/recipes/edit-recipe/edit-recipe.component';
import { AddRecipePortionsComponent } from './pages/recipes/add-recipe-portions/add-recipe-portions.component';
import { SettingsComponent } from './pages/settings/settings.component';

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
      { path: 'add-portion/:foodID', component: EditPortionFullscreenComponent },
      { path: 'add-recipe/:recipeId', component: AddRecipePortionsComponent },
      { path: ':portionId', component: EditPortionFullscreenComponent }
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
  { path: 'foods/add', component: EditFoodComponent, canActivate: [AuthGuard] },
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
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  }
  // { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  // onSameUrlNavigation allows pages refresh when lacking live connections
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
