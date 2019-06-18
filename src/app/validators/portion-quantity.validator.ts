import { AbstractControl, ValidatorFn } from '@angular/forms';

export function PortionQuantityValidator(
  control: AbstractControl
): { [key: string]: boolean } | null {
  // quantities are expressed with integers, in grams
  if (!Number.isInteger(control.value)) {
    return { integer: true };
  }

  if (control.value <= 0 || control.value >= 5000) {
    return { range: true };
  }

  return null;
}
