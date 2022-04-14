import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { UiService } from '../services/ui.service';
import { User } from '../models/user';
import { NoticeRoles } from '../ui/notice/notice.component';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  show: boolean;
  showConfirmation: boolean;

  loginForm: FormGroup;
  registerForm: FormGroup;

  loginName = new FormControl('', [Validators.required]);
  loginPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);

  registerName = new FormControl('', [Validators.required]);
  registerPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);
  confirmPassword = new FormControl('', [Validators.required]);

  public loginError = false;

  public noticeRoles = NoticeRoles;

  constructor(private auth: AuthenticationService, private ui: UiService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      loginName: this.loginName,
      loginPassword: this.loginPassword
    });

    this.registerForm = new FormGroup(
      {
        registerName: this.registerName,
        registerPassword: this.registerPassword,
        confirmPassword: this.confirmPassword
      },
      this.passwordsMistmatchValidator
    );

    this.confirmPassword.disable();
    this.registerPassword.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        this.confirmPassword.enable();
      } else {
        this.confirmPassword.disable();
      }
    });

    // redirect logged in users, must happen last to avoid template issues
    if (this.auth.currentUserValue) {
      this.ui.goToToday();
    }
  }

  // the password must be confirmed
  passwordsMistmatchValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
    const registerPassword = form.get('registerPassword');
    const confirmPassword = form.get('confirmPassword');

    return registerPassword && confirmPassword && registerPassword.value !== confirmPassword.value
      ? { passwordsMistmatch: true }
      : null;
  };

  get passwordsMismatch() {
    return (
      this.registerForm.hasError('passwordsMistmatch') &&
      (this.registerForm.touched || this.registerForm.dirty)
    );
  }

  get loginPasswordError() {
    return this.loginPassword.hasError('required')
      ? 'You must provide a password'
      : this.loginPassword.hasError('minlength')
        ? 'Longer password expected'
        : '';
  }

  handleLogin() {
    // in the unlikely case the form is submitted when invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.login(this.loginName.value, this.loginPassword.value);
  }

  private login(name: string, password: string): void {
    this.auth.login(name, password).subscribe((user: User) => {
      if (user) {
        this.loginError = false;
        this.ui.notify(`Logged in as ${user.name}`);
        this.ui.goToToday();
      } else {
        this.loginError = true;
      }
    });
  }

  handleRegistration() {
    if (this.registerForm.invalid) {
      return;
    }

    const registration = {
      name: this.registerName.value,
      password: this.registerPassword.value
    };

    this.auth
      .register(registration.name, registration.password)
      .subscribe(
        () => this.login(registration.name, registration.password),
        error => this.ui.warn(error)
      );
  }
}
