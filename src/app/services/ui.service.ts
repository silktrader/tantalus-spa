import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ReplaySubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Meal } from '../models/meal.model';

export enum Breakpoints {
  mobile = '(max-width: 959px)',
  desktop = '(min-width: 960px)'
}

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.mobile, Breakpoints.desktop]).subscribe(result => {
      if (!result.matches) {
        return;
      }

      // update both breakpoints
      this.mobileSubject.next(result.breakpoints[Breakpoints.mobile]);
      this.desktopSubject.next(result.breakpoints[Breakpoints.desktop]);
    });
  }

  get sidenavOpened(): boolean {
    return this.sidenav && this.sidenav.opened;
  }
  private readonly mobileSubject = new ReplaySubject<boolean>(1);
  public get mobile(): Observable<boolean> {
    return this.mobileSubject.asObservable();
  }

  private readonly desktopSubject = new ReplaySubject<boolean>(1);
  public get desktop(): Observable<boolean> {
    return this.desktopSubject.asObservable();
  }

  public sidenav: MatSidenav;

  private notificationsDuration = 3000;

  public notifyChangePortion(
    initial: { quantity: number; meal: number; foodName: string },
    final: { quantity: number; meal: number },
    undoAction: () => void
  ): void {
    const quantityDifference = final.quantity - initial.quantity;
    let message = `${initial.foodName}`;

    if (initial.meal !== final.meal) {
      message += ` moved to ${Meal.getName(final.meal)}`;
      if (quantityDifference !== 0) {
        message += `, `;
      }
    }

    if (quantityDifference > 0) {
      message += ` increased by ${quantityDifference}g.`;
    } else if (quantityDifference < 0) {
      message += ` decreased by ${-quantityDifference}g.`;
    }

    this.notify(message, 'Undo', undoAction);
  }

  public notify(message: string, actionName?: string, actionFunction?: () => void): void {
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
