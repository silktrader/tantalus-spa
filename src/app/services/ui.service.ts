import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { startWith } from 'rxjs/operators';

export enum Breakpoints {
  mobile = '(max-width: 959px)',
  desktop = '(min-width: 960px)'
}

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
      .observe([Breakpoints.mobile, Breakpoints.desktop])
      .subscribe(result => {
        if (!result.matches) { return; }

        // update both breakpoints
        this.mobile.next(result.breakpoints[Breakpoints.mobile]);
        this.desktop.next(result.breakpoints[Breakpoints.desktop]);
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
    this.sidenav.toggle();
  }

  public openSidenav() {
    this.sidenav.open();
  }

  public closeSidenav() {
    this.sidenav.close();
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
