import { Injectable } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Location } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UiService {
  public mobile = new ReplaySubject<boolean>(1);
  public desktop = new ReplaySubject<boolean>(1);

  public sidenav: MatSidenav;

  private notificationsDuration = 3000;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe(['(max-width: 959px', '(min-width: 960px)'])
      .subscribe(result => {
        if (!result.matches) {
          return;
        }

        // update both breakpoints
        this.mobile.next(result.breakpoints['(max-width: 959px']);
        this.desktop.next(result.breakpoints['(min-width: 960px)']);
      });
  }

  public notify(
    message: string,
    actionName?: string,
    actionFunction?: () => void
  ): void {
    const snackbarRef = this.snackBar.open(message, actionName || '', {
      duration: this.notificationsDuration
    });
    if (actionFunction) {
      snackbarRef.onAction().subscribe(actionFunction);
    }
  }

  public warn(message: string) {
    this.snackBar.open(message, '', { duration: this.notificationsDuration });
  }

  get sidenavOpened(): boolean {
    return this.sidenav && this.sidenav.opened;
  }

  public toggleSidenav() {
    console.log(this.sidenav);
    this.sidenav.toggle();
    // this.sidenavOpenedSubject.next(!this.sidenavOpenedSubject.value);
  }

  public openSidenav() {
    this.sidenav.open();
    // this.sidenavOpenedSubject.next(true);
  }

  public closeSidenav() {
    this.sidenav.close();
    // this.sidenavOpenedSubject.next(false);
  }

  public goLogin() {
    this.router.navigate(['/login']);
  }

  public goBack() {
    this.location.back();
  }

  public goToFoods() {
    this.router.navigate(['/foods']);
  }

  public goToFood(id: number) {
    this.router.navigate([`/foods/${id}`]);
  }
}
