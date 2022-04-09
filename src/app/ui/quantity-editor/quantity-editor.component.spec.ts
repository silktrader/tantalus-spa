import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuantityEditorComponent } from './quantity-editor.component';

describe('QuantityEditorComponent', () => {
  let component: QuantityEditorComponent;
  let fixture: ComponentFixture<QuantityEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuantityEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuantityEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
