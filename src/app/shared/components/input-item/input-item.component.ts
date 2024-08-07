import { Component, computed, inject, model, output } from '@angular/core';
import { IItemDefinition } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-item',
  templateUrl: './input-item.component.html',
  styleUrl: './input-item.component.scss',
})
export class InputItemComponent {
  private modService = inject(ModService);

  public item = model.required<IItemDefinition | undefined>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();

    return [
      ...mod.items.map((i) => ({
        category: 'My Mod Items',
        data: i,
        value: i.name,
      })),
    ];
  });
}
