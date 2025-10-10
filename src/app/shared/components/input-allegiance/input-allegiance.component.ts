import { Component, model, output } from '@angular/core';
import { Allegiance, AllegianceType } from '../../../../interfaces';

@Component({
    selector: 'app-input-allegiance',
    templateUrl: './input-allegiance.component.html',
    styleUrl: './input-allegiance.component.scss',
    standalone: false
})
export class InputAllegianceComponent {
  public allegiance = model.required<AllegianceType>();
  public change = output<AllegianceType>();

  public values = [...Object.values(Allegiance)];
}
