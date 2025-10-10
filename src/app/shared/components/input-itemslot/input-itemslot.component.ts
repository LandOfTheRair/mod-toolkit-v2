import { Component, computed, input, model, output } from '@angular/core';
import { ItemSlot, ItemSlotType } from '../../../../interfaces';

@Component({
    selector: 'app-input-itemslot',
    templateUrl: './input-itemslot.component.html',
    styleUrl: './input-itemslot.component.scss',
    standalone: false
})
export class InputItemslotComponent {
  public itemSlot = model.required<string | undefined>();
  public change = output<ItemSlotType>();
  public hasEquipmentPrefix = input<boolean>(false);

  public values = computed(() => [
    ...Object.values(ItemSlot)
      .sort()
      .map((x) => (this.hasEquipmentPrefix() ? `equipment.${x}` : x)),
  ]);
}
