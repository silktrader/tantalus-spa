import { Component, AfterViewInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';
import { Observable, Subject, of, BehaviorSubject } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-quantity-editor',
  templateUrl: './quantity-editor.component.html',
  styleUrls: ['./quantity-editor.component.css']
})
export class QuantityEditorComponent implements AfterViewInit {
  public input = new FormControl({
    value: undefined,
    validators: [Validators.required, PortionValidators.quantity]
  });

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
    }, 0);
  }

  public get value(): number {
    return this.input.value;
  }

  public set value(value: number) {
    this.input.setValue(value);
  }

  public get quantityError(): string {
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
}
