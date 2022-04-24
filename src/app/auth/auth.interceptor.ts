import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { catchError, switchMap } from 'rxjs/operators';
import { UiService } from '../services/ui.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly as: AuthService, private readonly ui: UiService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // add auth header with JWT to all outoing requests
    const user = this.as.user;

    // capture requests to the API endpoint, not the others
    if (user?.accessToken && request.url.startsWith(environment.apiUrl)) {
      const authenticatedRequest = request.clone({ setHeaders: { Authorization: `Bearer ${user.accessToken}` } });
      return next.handle(authenticatedRequest).pipe(
        catchError(error => {
          if (error.status === 401 && !request.url.includes('auth/signin'))
            return this.handle401Error(authenticatedRequest, next);

          if (error.status === 403) this.handleError(error);

          return throwError(error);
        })
      );
    }

    // non API requests, to external resources
    return next.handle(request);
  }

  private handleError(error) {
    this.ui.warn("Signing out due to unauthorised request", error);
    this.as.signout(); // remove access token, user info, etc.   
    this.ui.goLogin(); // redirect user to login page
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {

    return this.as.refreshToken().pipe(
      switchMap(user => {
        return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${user.accessToken}` }, withCredentials: true }));
      }),
      catchError(error => {
        if (error.status === 401 || error.status === 403) this.handleError(error);
        return throwError(error);
      })
    );
  }
}