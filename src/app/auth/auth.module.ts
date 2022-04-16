import {
  NgModule,
  ModuleWithProviders,
  Optional,
  SkipSelf,
} from '@angular/core';
import { AuthConfig } from './auth-config.model';
import { AuthInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationPromptComponent } from './components/authentication-prompt/authentication-prompt.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AuthenticationPromptComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  exports: [AuthenticationPromptComponent],
})
export class AuthModule {
  // looks for an AuthModule in an ancestor injector, when found throw an error to avoid multiple instances
  constructor(@Optional() @SkipSelf() parentModule?: AuthModule) {
    if (parentModule) {
      throw new Error(
        `${AuthModule.name} is already loaded and can be imported only once`
      );
    }
  }

  static forRoot(config: AuthConfig): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        { provide: AuthConfig, useValue: config },
      ],
    };
  }
}
