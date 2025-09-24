import { Component, model, output } from '@angular/core';
import { ItemSlotType } from '../../../../interfaces';
import { itemSlots } from '../../../helpers/schemas/_helpers';

@Component({
  selector: 'app-input-itemslot-encrust',
  templateUrl: './input-itemslot-encrust.component.html',
  styleUrl: './input-itemslot-encrust.component.scss',
})
export class InputItemslotEncrustComponent {
  public itemSlots = model.required<string[]>();
  public change = output<ItemSlotType | 'weapon' | 'armor'>();

  public values = [itemSlots].sort();
}
