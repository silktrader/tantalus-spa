import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShortPortionsListComponent } from './short-portions-list.component';

describe('ShortPortionsListComponent', () => {
  let component: ShortPortionsListComponent;
  let fixture: ComponentFixture<ShortPortionsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortPortionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortPortionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
