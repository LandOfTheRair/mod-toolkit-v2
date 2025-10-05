import { Component, computed, inject, model, output } from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-mapspawner',
  templateUrl: './input-mapspawner.component.html',
  styleUrl: './input-mapspawner.component.scss',
})
export class InputMapspawnerComponent {
  private modService = inject(ModService);

  public tag = model.required<string | undefined>();
  public change = output<string>();

  public values = computed(() => {
    const maps = this.modService.availableMaps();
    return [
      ...new Set(
        maps.flatMap(
          (m) =>
            m.map.layers[10].objects.map(
              (spawner: any) => spawner.properties.tag as string,
            ) as string,
        ),
      ),
    ].sort();
  });
}
