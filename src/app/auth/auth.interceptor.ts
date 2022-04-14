import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly as: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with JWT to all outoing requests
    const user = this.as.user;

    // capture requests to the API endpoint, not the others
    if (user?.accessToken && request.url.startsWith(environment.apiUrl)) {
      const authenticatedRequest = request.clone({ setHeaders: { Authorization: `Bearer ${user.accessToken}` } });
      return next.handle(authenticatedRequest).pipe(
        catchError(error => {
          if (error.status === 401 && !request.url.includes('auth/signin'))
            return this.handle401Error(authenticatedRequest, next);

          return throwError(error);
        })
      );
    }

    // non API requests, to external resources
    return next.handle(request);
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    console.log('handling 401');

    return this.as.refreshToken().pipe(
      switchMap(user => {
        return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${user.accessToken}` } }));
      }),
      catchError(error => {

        this.as.signout();
        return throwError(error);
      })
    );
  }
}