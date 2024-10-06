import { Component, model, output } from '@angular/core';
import {
  DynamicEventRarity,
  DynamicEventRarityType,
} from '../../../../interfaces';

@Component({
  selector: 'app-input-eventrarity',
  templateUrl: './input-eventrarity.component.html',
  styleUrl: './input-eventrarity.component.scss',
})
export class InputEventRarityComponent {
  public rarity = model.required<DynamicEventRarityType | undefined>();
  public change = output<DynamicEventRarityType>();

  public values = [...Object.values(DynamicEventRarity).sort()];
}
