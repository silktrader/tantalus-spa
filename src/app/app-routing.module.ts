import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FoodsComponent } from './pages/foods/foods.component';
import { EditFoodComponent } from './foods/edit-food/edit-food.component';
import { DiaryComponent } from './pages/diary/diary.component';
import { DiarySummaryComponent } from './pages/diary/diary-summary/diary-summary.component';
import { EditPortionFullscreenComponent } from './pages/diary/edit-portion-fullscreen/edit-portion-fullscreen.component';
import { SelectPortionComponent } from './pages/diary/select-portion/select-portion.component';
import { RecipesSummaryComponent } from './pages/recipes/recipe-summary/recipes-summary.component';
import { EditRecipeComponent } from './pages/recipes/edit-recipe/edit-recipe.component';
import { AddRecipePortionsComponent } from './pages/recipes/add-recipe-portions/add-recipe-portions.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthenticationPromptComponent } from './auth/components/authentication-prompt/authentication-prompt.component';
import { AddFoodComponent } from './foods/add-food/add-food.component';
import { StatsOverviewComponent } from './stats/stats-overview/stats-overview.component';
import { MoodStatsComponent } from './stats/mood-stats/mood-stats.component';

const routes: Routes = [
  { path: 'login', component: AuthenticationPromptComponent },
  { path: 'register', component: AuthenticationPromptComponent },
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
  { path: 'foods/add', component: AddFoodComponent, canActivate: [AuthGuard] },
  { path: 'foods/:id', component: EditFoodComponent, canActivate: [AuthGuard] },
  {
    path: 'recipes', component: RecipesSummaryComponent, canActivate: [AuthGuard]
  },
  {
    path: 'recipes/:id', component: EditRecipeComponent, canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    component: StatsOverviewComponent,
    canActivate: [AuthGuard],
  },
  { path: 'stats/mood', component: MoodStatsComponent, canActivate: [AuthGuard] },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
