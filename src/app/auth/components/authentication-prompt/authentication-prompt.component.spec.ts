import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationPromptComponent } from './authentication-prompt.component';

describe('AuthenticationPromptComponent', () => {
  let component: AuthenticationPromptComponent;
  let fixture: ComponentFixture<AuthenticationPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthenticationPromptComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticationPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
