import {
  Component,
  computed,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { StatType } from '../../../../interfaces';
import { coreStats, extraStats } from '../../../helpers';

@Component({
  selector: 'app-input-stat',
  templateUrl: './input-stat.component.html',
  styleUrl: './input-stat.component.scss',
  standalone: false,
})
export class InputStatComponent implements OnInit {
  public stat = model<StatType | undefined>();
  public label = input<string>('Stat');
  public change = output<StatType>();
  public allowCore = input<boolean>(true);
  public allowExtra = input<boolean>(true);
  public defaultValue = input<StatType | undefined>(undefined);

  public values = computed(() => {
    const allowCore = this.allowCore();
    const allowExtra = this.allowExtra();

    return [
      ...(allowCore ? coreStats.map((x) => x.stat) : []),
      ...(allowExtra ? extraStats.map((x) => x.stat) : []),
    ];
  });

  ngOnInit() {
    const defaultValue = this.defaultValue();
    if (defaultValue && this.values().includes(defaultValue)) {
      this.stat.set(defaultValue);
    }
  }
}
