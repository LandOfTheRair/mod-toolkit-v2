import { Component, computed, input, model, output } from '@angular/core';
import { ItemClassType, StatType } from '../../../../interfaces';
import { coreStats, extraStats } from '../../../helpers';

@Component({
    selector: 'app-input-stat',
    templateUrl: './input-stat.component.html',
    styleUrl: './input-stat.component.scss',
    standalone: false
})
export class InputStatComponent {
  public stat = model.required<StatType | undefined>();
  public label = input<string>('Stat');
  public change = output<ItemClassType>();
  public allowCore = input<boolean>(true);
  public allowExtra = input<boolean>(true);

  public values = computed(() => {
    const allowCore = this.allowCore();
    const allowExtra = this.allowExtra();

    return [
      ...(allowCore ? coreStats.map((x) => x.stat) : []),
      ...(allowExtra ? extraStats.map((x) => x.stat) : []),
    ];
  });
}
