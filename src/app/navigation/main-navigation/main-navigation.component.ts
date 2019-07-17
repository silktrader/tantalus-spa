import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UiService } from 'src/app/services/ui.service';
import { MatSidenav } from '@angular/material/sidenav';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mainSidenav', { static: false }) public sidenav: MatSidenav;

  constructor(
    private auth: AuthenticationService,
    private ui: UiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.ui.sidenav = this.sidenav;

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

    // must happen at this stage else the conditional ngIf* will impede the assignment
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.ui.sidenav = undefined;
  }

  get User(): Observable<User> {
    return this.auth.currentUser;
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

  handleLogout(): void {
    this.auth.logout();
    this.ui.goLogin();
  }
}
