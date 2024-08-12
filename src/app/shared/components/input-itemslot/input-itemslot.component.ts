import { Component, model, output } from '@angular/core';
import { ItemSlot, ItemSlotType } from '../../../../interfaces';

@Component({
  selector: 'app-input-itemslot',
  templateUrl: './input-itemslot.component.html',
  styleUrl: './input-itemslot.component.scss',
})
export class InputItemslotComponent {
  public itemSlot = model.required<string | undefined>();
  public change = output<ItemSlotType>();

  public values = [...Object.values(ItemSlot).sort()];
}
