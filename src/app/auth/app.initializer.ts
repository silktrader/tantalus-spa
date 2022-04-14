import { EMPTY } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

// return an observable that concludes with either an empty result, when no token is present, or with a refresh token request
export function appInitializerFactory(authService: AuthService) {
  return () =>
    authService.user$.pipe(
      take(1),
      map((user) => (user ? authService.refreshToken() : EMPTY))
    );
}
