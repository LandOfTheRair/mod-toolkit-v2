import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { ElectronService } from '../../../services/electron.service';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-effect',
  templateUrl: './input-effect.component.html',
  styleUrl: './input-effect.component.scss',
})
export class InputEffectComponent implements OnInit {
  private electronService = inject(ElectronService);
  private modService = inject(ModService);

  public effect = model<string | undefined>();
  public label = input<string>('Effect');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const effectObj = this.modService.json()['effect-data'] as Record<
      string,
      any
    >;
    return [
      ...[
        {
          value: 'Attribute',
          desc: 'Default attributes, like resistances or weaknesses',
        },
        {
          value: 'Mood',
          desc: 'Mood fluctuates based on NPC health. NPC enrages after a certain time period.',
        },
      ],
      ...Object.keys(effectObj ?? {})
        .sort()
        .filter((x) => !['Attribute', 'Mood'].includes(x))
        .map((t) => ({
          value: t,
          desc: effectObj[t].tooltip?.desc ?? 'No description',
        })),
    ];
  });

  constructor() {
    this.electronService.requestJSON('effect-data');
  }

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);
      this.effect.set(foundItem as unknown as string);
    }
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
