import { BrowserModule } from "@angular/platform-browser";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { MaterialModule } from "./material/material.module";
import { AppRoutingModule } from "./app-routing.module";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ToolbarComponent } from "./ui/toolbar/toolbar.component";
import { FoodsComponent } from "./pages/foods/foods.component";
import { EditFoodComponent } from "./foods/edit-food/edit-food.component";
import { MainNavigationComponent } from "./navigation/main-navigation/main-navigation.component";
import { DiaryComponent } from "./pages/diary/diary.component";
import { DiarySummaryComponent } from "./pages/diary/diary-summary/diary-summary.component";
import { EditPortionFullscreenComponent } from "./pages/diary/edit-portion-fullscreen/edit-portion-fullscreen.component";
import { SelectPortionComponent } from "./pages/diary/select-portion/select-portion.component";
import { RecipesSummaryComponent } from "./pages/recipes/recipe-summary/recipes-summary.component";
import { EditRecipeComponent } from "./pages/recipes/edit-recipe/edit-recipe.component";
import { AddRecipePortionsComponent } from "./pages/recipes/add-recipe-portions/add-recipe-portions.component";
import { EditPortionDialogComponent } from "./pages/diary/edit-portion-dialog/edit-portion-dialog.component";
import { QuantityEditorComponent } from "./ui/quantity-editor/quantity-editor.component";
import { FocusThenSelectDirective } from "./directives/focus-then-select.directive";
import { AddPortionDialogComponent } from "./pages/diary/add-portion-dialog/add-portion-dialog.component";
import { NoticeComponent } from "./ui/notice/notice.component";
import { SettingsComponent } from "./pages/settings/settings.component";
import { LongPortionsListComponent } from "./pages/diary/long-portions-list/long-portions-list.component";
import { ShortPortionsListComponent } from "./pages/diary/short-portions-list/short-portions-list.component";
import { appInitializerFactory } from "./auth/app.initializer";
import { AuthService } from "./auth/auth.service";
import { AuthModule } from "./auth/auth.module";
import { AddFoodComponent } from './foods/add-food/add-food.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ToolbarComponent,
    FoodsComponent,
    EditFoodComponent,
    MainNavigationComponent,
    DiaryComponent,
    DiarySummaryComponent,
    EditPortionFullscreenComponent,
    SelectPortionComponent,
    RecipesSummaryComponent,
    EditRecipeComponent,
    AddRecipePortionsComponent,
    EditPortionDialogComponent,
    QuantityEditorComponent,
    FocusThenSelectDirective,
    AddPortionDialogComponent,
    NoticeComponent,
    SettingsComponent,
    LongPortionsListComponent,
    ShortPortionsListComponent,
    AddFoodComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule,
    AuthModule.forRoot({ backendUrl: 'https://localhost:7013/api/users' }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      multi: true,
      deps: [AuthService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
