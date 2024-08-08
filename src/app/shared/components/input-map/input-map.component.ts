import { Component, computed, inject, model, output } from '@angular/core';
import { uniq } from 'lodash';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-map',
  templateUrl: './input-map.component.html',
  styleUrl: './input-map.component.scss',
})
export class InputMapComponent {
  private modService = inject(ModService);

  public map = model.required<string>();
  public change = output<string>();

  public values = computed(() =>
    uniq(this.modService.mod().maps.map((m) => m.name)).sort()
  );
}
