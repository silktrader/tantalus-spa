import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationComponent } from './authentication/authentication.component';
import { MaterialModule } from './material/material.module';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { ToolbarComponent } from './ui/toolbar/toolbar.component';
import { FoodsComponent } from './pages/foods/foods.component';
import { EditFoodComponent } from './pages/edit-food/edit-food.component';
import { MainNavigationComponent } from './navigation/main-navigation/main-navigation.component';
import { UnauthorisedErrorInterceptor } from './services/unauthorised-error.interceptor.ts.service';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    DashboardComponent,
    ToolbarComponent,
    FoodsComponent,
    EditFoodComponent,
    MainNavigationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorisedErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
