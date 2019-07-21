import { Directive, ElementRef, AfterViewInit } from '@angular/core';

/**
 * A less than ideal directive triggering `select` and `focus` events.
 * The implementation would fail in DOM-less contexts. Renderer2 doesn't offer alternatives at the moment.
 */
@Directive({
  selector: '[appFocusThenSelect]'
})
export class FocusThenSelectDirective implements AfterViewInit {
  constructor(private el: ElementRef) {
    if (!el.nativeElement.focus) {
      throw new Error(`The element can't be focused`);
    }
  }

  ngAfterViewInit(): void {
    const input: HTMLInputElement = this.el.nativeElement as HTMLInputElement;
    // other elements, set to gain focus at a later stage, will lose focus
    setTimeout(() => {
      input.focus();
      input.select();
    }, 10);
  }
}
