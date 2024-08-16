import { Component, model, output } from '@angular/core';
import { ItemSlot, ItemSlotType } from '../../../../interfaces';

@Component({
  selector: 'app-input-itemslot-encrust',
  templateUrl: './input-itemslot-encrust.component.html',
  styleUrl: './input-itemslot-encrust.component.scss',
})
export class InputItemslotEncrustComponent {
  public itemSlots = model.required<string[]>();
  public change = output<ItemSlotType | 'weapon' | 'armor'>();

  public values = [...Object.values(ItemSlot), 'weapon', 'armor'].sort();
}
