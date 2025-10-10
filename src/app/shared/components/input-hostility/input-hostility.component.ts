import { Component, model, output } from '@angular/core';
import { Hostility, HostilityType } from '../../../../interfaces';

@Component({
    selector: 'app-input-hostility',
    templateUrl: './input-hostility.component.html',
    styleUrl: './input-hostility.component.scss',
    standalone: false
})
export class InputHostilityComponent {
  public hostility = model.required<HostilityType>();
  public change = output<HostilityType>();

  public values = [...Object.keys(Hostility)];
}
