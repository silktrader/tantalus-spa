import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first, flatMap, tap, catchError } from 'rxjs/operators';
import { UserInfo } from './user-info.model';
import { AuthConfig } from './auth-config.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly backendUrl: string;
  private readonly userKeyName: string;

  // will be set to null when local storage isn't initialised
  private readonly userSubject$: BehaviorSubject<UserInfo | null>;

  // expose the user subject but negate the ability to emit new values
  public readonly user$: Observable<UserInfo | null>;

  constructor(config: AuthConfig, private readonly http: HttpClient, private readonly router: Router) {
    this.backendUrl = config.backendUrl;
    this.userKeyName = config.userKeyName ?? 'user';

    // must attempt to fetch the keys after their name is defined
    const userKeyName = localStorage.getItem(this.userKeyName);     // tk can clarify usage
    this.userSubject$ = new BehaviorSubject<UserInfo | null>(
      userKeyName ? JSON.parse(userKeyName) : null
    );
    this.user$ = this.userSubject$.asObservable();

    // update the local storage when new user data are fetched (ie. signin, refresh token, etc.)
    this.userSubject$.subscribe({
      next: user => {
        if (user) localStorage.setItem(this.userKeyName, JSON.stringify(user));
        else localStorage.removeItem(this.userKeyName);
      }
    });
  }

  public get user(): UserInfo | null {
    return this.userSubject$.value;
  }

  signin(name: string, password: string): Observable<UserInfo | undefined> {
    // must include `withCredentials = true` even with `GET` requests, while signing in, to accept cookies
    return this.http
      .post<UserInfo>(`${this.backendUrl}/signin`, { name, password }, { withCredentials: true })
      .pipe( // tk errors should be caught by the interceptor
        first(), // tk why first() again?
        map((userInfo: UserInfo) => {
          this.userSubject$.next(userInfo);
          this.startRefreshTokenTimer(userInfo.accessToken);
          return userInfo;
        })
      );
  }

  signout() {
    this.http
      .post<void>(`${this.backendUrl}/revoke-token`, {}, { withCredentials: true })
      .subscribe(); // tk handle errors
    this.stopRefreshTokenTimer();
    this.userSubject$.next(null);
    this.router.navigate(['/user']);
  }

  signUp(
    name: string,
    email: string,
    password: string
  ): Observable<UserInfo | undefined> {
    return this.http
      .post<void>(`${this.backendUrl}/signup`, {
        name,
        email,
        password,
      })
      .pipe(flatMap(() => this.signin(name, password)));
  }

  refreshToken() {
    return this.http
      .post<UserInfo>(`${this.backendUrl}/refresh-token`, {}, { withCredentials: true })  // must leave empty body
      .pipe(
        tap(user => {
          this.userSubject$.next(user);     // fetches new access token
          //this.startRefreshTokenTimer(user.accessToken);
        }),
      );
  }

  private refreshTokenTimeout: ReturnType<typeof setTimeout>;

  private startRefreshTokenTimer(accessToken: string) {
    // parse json object from base64 encoded jwt token
    // const expiration = new Date(JSON.parse(atob(accessToken.split('.')[1])).exp * 1000).getTime();
    // console.log(new Date(expiration).toLocaleTimeString());

    // // set a timeout to refresh the token a minute before it expires
    // const timeout = new Date(expiration * 1000).getTime() - Date.now() - 60 * 1000;
    // console.log(timeout);
    // this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
