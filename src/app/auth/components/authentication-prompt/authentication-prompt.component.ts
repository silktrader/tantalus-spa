import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { UiService } from 'src/app/services/ui.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-authentication-prompt',
  templateUrl: './authentication-prompt.component.html',
  styleUrls: ['./authentication-prompt.component.scss'],
})
export class AuthenticationPromptComponent implements OnInit {
  ngOnInit(): void {
    // redirect logged in users, must happen last to avoid template issues
    if (this.as.user) this.ui.goToToday();
  }

  readonly signInPassword = new FormControl(undefined, [Validators.required]);
  readonly signInForm = new FormGroup({
    username: new FormControl(undefined, [Validators.required]),
    password: this.signInPassword,
  });

  readonly registerForm = new FormGroup({
    username: new FormControl(undefined, [Validators.required]),
    email: new FormControl(undefined, [Validators.required, Validators.email]),
    password: new FormControl(undefined, [Validators.required]),
  });

  passwordVisible = false;
  readonly loading$ = new BehaviorSubject<boolean>(false);

  private get returnUrl() {
    return this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  constructor(
    private readonly as: AuthService,
    private readonly ui: UiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  signIn(): void {
    const { username, password } = this.signInForm.value;
    this.loading$.next(true);
    this.as
      .signin(username, password)
      .pipe(first())  // tk why is this needed?
      .subscribe({
        next: (user) => {
          this.loading$.next(false);
          this.ui.notify(`Signed in as ${user.username}`);
          if (user) this.router.navigate([this.returnUrl]);
        },
        error: error => {
          // clear the input
          this.signInForm.reset();
          this.signInForm.setErrors({ wrongCredentials: true });
          this.loading$.next(false);
          this.ui.warn('Error while signing in');
          console.log(error);
        },
        complete: () => console.info('done signing in')
      }
      );
  }

  register(): void {
    const { username, email, password } = this.registerForm.value;
    this.loading$.next(true);
    this.as.signUp(username, email, password).subscribe({
      next: (user) => {
        this.loading$.next(false);
        if (user) this.router.navigate([this.returnUrl]);
      },
      error: () => {
        // clear the input
        this.ui.warn('Error while register new user');
        this.registerForm.reset();
        this.registerForm.setErrors({ wrongCredentials: true });
        this.loading$.next(false);
      },
    });
  }
}
