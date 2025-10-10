import { Component, computed, HostBinding, inject, input } from '@angular/core';
import { ElectronService } from '../../../services/electron.service';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrl: './icon.component.scss',
    standalone: false
})
export class IconComponent {
  private electronService = inject(ElectronService);

  public icon = input.required<string | undefined>();
  public color = input<string | undefined>();
  public bgColor = input<string | undefined>();
  public borderColor = input<string | undefined>();

  public baseUrl = computed(() => {
    if (!this.electronService.isInElectron()) {
      return 'https://play.rair.land/assets';
    }

    return 'lotr://./resources/assets';
  });

  @HostBinding('style.outline-color')
  get outlineColor() {
    return this.borderColor();
  }

  @HostBinding('style.outline-style')
  get outlineStyle() {
    return this.borderColor() ? 'solid' : '';
  }
}
