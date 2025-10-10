import { Directive, effect, model } from '@angular/core';

@Directive({
  selector: '[autoTrim]',
  standalone: false,
})
export class AutoTrimDirective {
  public ngModel = model<string>('ngModel');

  private timeoutHandle!: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      clearTimeout(this.timeoutHandle);

      const newValue = this.ngModel();

      this.timeoutHandle = setTimeout(() => {
        this.ngModel.set(
          (newValue ?? '').toString().replace(/\s+/g, ' ').trim() ?? newValue,
        );
      }, 500);
    });
  }
}
