import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { UiService } from './ui.service';

@Injectable()
export class UnauthorisedErrorInterceptor implements HttpInterceptor {
  constructor(private auth: AuthenticationService, private ui: UiService) {}

  // allows to intercept all 401 errors (unauthorised responses) and automatically logs out, clearing the local storage
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error.status === 401) {
          // warn the user about the log out
          this.ui.warn(`Logging out due to unauthorised request`);

          // this.auth.logout();
          // redirect user to login page
          // this.ui.goLogin();
        }

        // don't catch other exceptions
        return throwError(error.error.message || error.statusText);
      })
    );
  }
}
