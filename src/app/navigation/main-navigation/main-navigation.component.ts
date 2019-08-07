import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UiService } from 'src/app/services/ui.service';
import { MatSidenav } from '@angular/material/sidenav';
import { User } from 'src/app/models/user';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent implements OnInit, OnDestroy {
  private sidenavComponent: MatSidenav;
  @ViewChild(MatSidenav, { static: false }) set sidenav(matSidenav: MatSidenav) {
    if (matSidenav === undefined) {
      return;
    }

    // the setter allows the sidenav to be registered during the ngIf evaluation
    this.sidenavComponent = matSidenav;
    this.ui.sidenav = matSidenav;

    // the breakpoint observer might not trigger a change after a login
    if (this.ui.isMobile) {
      setTimeout(() => this.setMobileSidenav(), 0);
    } else {
      setTimeout(() => this.setDesktopSidenav(), 0);
    }
  }

  public authenticatedUser: User;
  private subscription = new Subscription();

  constructor(private auth: AuthenticationService, private ui: UiService) {}

  ngOnInit(): void {
    // avoid `expression checked after it's been checked` error
    this.subscription.add(
      this.auth.currentUser.pipe(delay(0)).subscribe(user => {
        this.authenticatedUser = user;
      })
    );
    this.subscription.add(
      this.ui.mobile.subscribe(isMobile => {
        if (isMobile) {
          this.setMobileSidenav();
        }
      })
    );

    this.subscription.add(
      this.ui.desktop.subscribe(isDesktop => {
        if (isDesktop) {
          this.setDesktopSidenav();
        }
      })
    );
  }

  private setDesktopSidenav(): void {
    if (this.sidenavComponent) {
      this.sidenavComponent.disableClose = true;
      this.sidenavComponent.mode = 'side';
      this.sidenavComponent.open();
    }
  }

  private setMobileSidenav(): void {
    if (this.sidenavComponent) {
      this.sidenavComponent.disableClose = false;
      this.sidenavComponent.mode = 'over';
      this.sidenavComponent.close();
    }
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
    this.auth.logout();
    this.ui.goLogin();
  }
}
