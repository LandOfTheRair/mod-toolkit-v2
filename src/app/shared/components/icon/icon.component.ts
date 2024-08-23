import { Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  public icon = input.required<string | undefined>();
  public color = input<string | undefined>();
  public bgColor = input<string | undefined>();
  public borderColor = input<string | undefined>();

  @HostBinding('style.outline-color')
  get outlineColor() {
    return this.borderColor();
  }
}
