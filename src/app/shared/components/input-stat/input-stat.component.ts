import { Component, model, output } from '@angular/core';
import { ItemClassType, StatType } from '../../../../interfaces';
import { coreStats, extraStats } from '../../../helpers';

@Component({
  selector: 'app-input-stat',
  templateUrl: './input-stat.component.html',
  styleUrl: './input-stat.component.scss',
})
export class InputStatComponent {
  public stat = model.required<StatType>();
  public change = output<ItemClassType>();

  public values = [
    ...coreStats.map((x) => x.stat),
    ...extraStats.map((x) => x.stat),
  ];
}
