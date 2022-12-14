import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { UserInfo } from 'src/app/auth/user-info.model';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatSidenav) public sidenav: MatSidenav;

  public authenticatedUser: UserInfo;
  private subscription = new Subscription();

  public dateInput = new FormControl();

  constructor(private as: AuthService, private ui: UiService) { }

  ngAfterViewInit(): void {
    this.ui.sidenav = this.sidenav;
  }

  ngOnInit(): void {

    // avoid `expression checked after it's been checked` error
    this.subscription.add(
      this.as.user$.pipe(delay(0)).subscribe(user => {
        this.authenticatedUser = user;
      })
    );

    this.subscription.add(
      this.dateInput.valueChanges.subscribe((date: Date) => {
        this.ui.goToDate(date);
        this.navigateAway();
      })
    );
  }

  ngOnDestroy(): void {
    this.ui.sidenav = undefined;
    this.subscription.unsubscribe();
  }

  public get today(): Date {
    return new Date();
  }

  public get yesterday(): Date {
    const date = this.today;
    date.setDate(date.getDate() - 1);
    return date;
  }

  public get tomorrow(): Date {
    const date = this.today;
    date.setDate(date.getDate() + 1);
    return date;
  }

  public handleLogout(): void {
    this.as.signout();
    this.ui.goLogin();
  }

  public navigateAway(): void {
    if (this.ui.isMobile) {
      this.ui.closeSidenav();
    }
  }
}
