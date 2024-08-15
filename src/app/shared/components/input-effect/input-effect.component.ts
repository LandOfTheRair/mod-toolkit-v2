import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { ElectronService } from '../../../services/electron.service';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-effect',
  templateUrl: './input-effect.component.html',
  styleUrl: './input-effect.component.scss',
})
export class InputEffectComponent {
  private electronService = inject(ElectronService);
  private modService = inject(ModService);

  public effect = model.required<string>();
  public label = input<string>('Effect');
  public change = output<string>();

  public values = computed(() => {
    const effectObj = this.modService.json()['effect-data'] as Record<
      string,
      any
    >;
    return Object.keys(effectObj ?? {})
      .sort()
      .map((t) => ({
        value: t,
        desc: effectObj[t].tooltip?.desc ?? 'No description',
      }));
  });

  constructor() {
    this.electronService.requestJSON('effect-data');
  }

  public itemCompare(
    itemA: { value: string; desc: string },
    itemB: { value: string; desc: string }
  ): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
