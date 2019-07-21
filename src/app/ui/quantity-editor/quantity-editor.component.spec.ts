import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityEditorComponent } from './quantity-editor.component';

describe('QuantityEditorComponent', () => {
  let component: QuantityEditorComponent;
  let fixture: ComponentFixture<QuantityEditorComponent>;

  beforeEach(async(() => {
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
