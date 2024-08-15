import { Component, computed, inject, model, output } from '@angular/core';
import { uniq } from 'lodash';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-region',
  templateUrl: './input-region.component.html',
  styleUrl: './input-region.component.scss',
})
export class InputRegionComponent {
  private modService = inject(ModService);

  public region = model.required<string | undefined>();
  public change = output<string>();

  public values = computed(() =>
    uniq(
      this.modService.mod().maps.map((m) => m.map.properties.region as string)
    ).sort()
  );
}
