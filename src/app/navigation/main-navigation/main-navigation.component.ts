import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CalendarService } from 'src/app/services/calendar.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UiService } from 'src/app/services/ui.service';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mainSidenav') public sidenav: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(
    private breakpointObserver: BreakpointObserver,
    public calendar: CalendarService,
    private auth: AuthenticationService,
    private ui: UiService
  ) {}

  ngOnInit(): void {
    this.ui.mobile.subscribe(isMobile => {
      if (!isMobile || !this.sidenav) {
        return;
      }
      this.sidenav.disableClose = false;
      this.ui.closeSidenav();
      this.sidenav.mode = 'over';
    });

    this.ui.desktop.subscribe(isDesktop => {
      if (!isDesktop || !this.sidenav) {
        return;
      }
      this.sidenav.disableClose = true;
      this.sidenav.open();
      this.sidenav.mode = 'side';
    });
  }

  ngAfterViewInit(): void {
    // must happen at this stage else the conditional ngIf* will impede the assignment
    this.ui.sidenav = this.sidenav;
  }

  ngOnDestroy(): void {
    this.ui.sidenav = undefined;
  }

  get User() {
    return this.auth.currentUser;
  }

  handleLogout(): void {
    this.auth.logout();
    this.ui.goLogin();
  }
}
