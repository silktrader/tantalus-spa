import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortPortionsListComponent } from './short-portions-list.component';

describe('ShortPortionsListComponent', () => {
  let component: ShortPortionsListComponent;
  let fixture: ComponentFixture<ShortPortionsListComponent>;

  beforeEach(async(() => {
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
