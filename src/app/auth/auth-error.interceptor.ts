import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { UiService } from "../services/ui.service";
import { AuthService } from "./auth.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private ui: UiService) { }

  intercept(request: HttpRequest<never>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status == 403 && this.authService.user) {
          // warn the user about signing out
          this.ui.warn("Signing out due to unauthorised request");

          // auto logout if 403 response returned from api
          this.authService.signout();

          // redirect user to login page
          this.ui.goLogin();
        }

        // don't catch other exceptions
        return throwError(error.error.message || error.statusText);
      })
    );
  }
}
