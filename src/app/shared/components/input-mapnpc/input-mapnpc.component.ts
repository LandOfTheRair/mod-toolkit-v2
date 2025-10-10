import { Component, computed, inject, model, output } from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-mapnpc',
    templateUrl: './input-mapnpc.component.html',
    styleUrl: './input-mapnpc.component.scss',
    standalone: false
})
export class InputMapnpcComponent {
  private modService = inject(ModService);

  public tag = model.required<string | undefined>();
  public change = output<string>();

  public values = computed(() => {
    const maps = this.modService.availableMaps();
    return [
      ...new Set(
        maps.flatMap(
          (m) =>
            m.map.layers[9].objects.map(
              (npc: any) => npc.properties.tag as string
            ) as string
        )
      ),
    ].sort();
  });
}
