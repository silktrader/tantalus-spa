import { Component, OnInit, AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PortionValidators } from 'src/app/validators/portion-quantity.validator';

@Component({
  selector: 'app-quantity-editor',
  templateUrl: './quantity-editor.component.html',
  styleUrls: ['./quantity-editor.component.css']
})
export class QuantityEditorComponent implements AfterViewInit {
  private input = new FormControl(undefined, [Validators.required, PortionValidators.quantity]);

  @Input() readonly initialValue: number;

  constructor() {}

  ngAfterViewInit(): void {
    // necessary to avoid change detection issues within mat dialogs
    setTimeout(() => this.input.setValue(this.initialValue), 0);
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

  public get changed(): boolean {
    if (this.initialValue === undefined) {
      throw new Error('No initial state was set'); // tk handle it later
    }
    return this.initialValue !== this.value;
  }
}
