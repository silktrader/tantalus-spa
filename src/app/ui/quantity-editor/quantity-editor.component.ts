import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-quantity-editor',
  templateUrl: './quantity-editor.component.html',
  styleUrls: ['./quantity-editor.component.css']
})
export class QuantityEditorComponent implements AfterViewInit {
  public input = new FormControl(undefined, [Validators.required, PortionValidators.quantity]);

  @ViewChild(MatInput, { static: false }) matInput: MatInput;
  @Input() readonly initialValue: number;

  private disabledState: boolean;
  @Input() set disabled(value: boolean) {
    this.disabledState = value;
    this.disabledSubject.next(value);
  }

  get disabled(): boolean {
    return this.disabledState;
  }

  private disabledSubject = new BehaviorSubject(false);

  private readyField = false;
  public get ready() {
    return this.readyField;
  }

  constructor() {}

  ngAfterViewInit(): void {
    // necessary to avoid change detection issues within mat dialogs
    setTimeout(() => {
      if (this.initialValue) {
        this.input.setValue(this.initialValue);
      }

      this.disabledSubject.subscribe(disabled => {
        if (disabled) {
          this.input.reset();
          this.input.disable();
        } else {
          this.input.enable();
        }
      });

      this.readyField = true;
    }, 0);
  }

  public get value(): number {
    return this.input.value;
  }

  public set value(value: number) {
    this.input.setValue(value);
  }

  public get error(): string {
    return PortionValidators.getQuantityError(this.input);
  }

  public get valid(): boolean {
    return this.input.valid;
  }

  public get dirty(): boolean {
    return this.input.dirty;
  }

  public get changed(): boolean {
    if (this.initialValue === undefined) {
      throw new Error('No initial state was set'); // tk handle it later
    }
    return this.initialValue !== this.value;
  }

  public get valueChanges(): Observable<number> {
    return this.input.valueChanges;
  }

  public reset(newValue: number): void {
    return this.input.reset(newValue);
  }

  public focus(): void {
    this.matInput.focus();
  }
}
