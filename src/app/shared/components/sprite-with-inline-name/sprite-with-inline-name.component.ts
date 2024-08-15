import { Component, computed, inject, input } from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-sprite-with-inline-name',
  templateUrl: './sprite-with-inline-name.component.html',
  styleUrl: './sprite-with-inline-name.component.scss',
})
export class SpriteWithInlineNameComponent {
  private modService = inject(ModService);

  public name = input.required<string>();
  public type = input.required<'items' | 'creatures'>();

  public sprite = computed(() => {
    const mod = this.modService.mod();
    const name = this.name();
    const type = this.type();

    if (type === 'items') {
      const foundItem = mod.items.find((i) => i.name === name);
      return foundItem?.sprite ?? -1;
    }

    if (type === 'creatures') {
      const foundNpc = mod.npcs.find((i) => i.npcId === name);
      return foundNpc?.sprite[0] ?? -1;
    }

    return -1;
  });
}
