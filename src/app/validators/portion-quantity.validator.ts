import { AbstractControl, FormControl } from '@angular/forms';

export class PortionValidators {
  public static quantity(control: AbstractControl): { [key: string]: boolean } | null {
    // quantities are expressed with integers, in grams
    if (!Number.isInteger(control.value)) {
      return { integer: true };
    }

    if (control.value <= 0 || control.value >= 3000) {
      return { range: true };
    }

    return null;
  }

  public static getQuantityError(control: FormControl) {
    if (control.hasError('required')) {
      return 'Required';
    }
    if (control.hasError('integer')) {
      return 'No decimals allowed';
    }
    if (control.hasError('range')) {
      return 'Invalid quantity';
    }
    return 'Invalid input';
  }
}
