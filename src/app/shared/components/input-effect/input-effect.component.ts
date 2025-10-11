import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { sortBy } from 'lodash';
import { ISTEM } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

const baseEffectList = [
  {
    value: 'Attribute',
    desc: 'Default attributes, like resistances or weaknesses',
  },
  {
    value: 'Mood',
    desc: 'Mood fluctuates based on NPC health. NPC enrages after a certain time period.',
  },
];

@Component({
  selector: 'app-input-effect',
  templateUrl: './input-effect.component.html',
  styleUrl: './input-effect.component.scss',
  standalone: false,
})
export class InputEffectComponent {
  private modService = inject(ModService);

  public effect = model<{ value: string } | undefined>();
  public label = input<string>('Effect');
  public defaultValue = input<string>();
  public additionalEffectFromSTEM = input<ISTEM>();
  public change = output<string>();

  public values = computed(() => {
    const baseEffects = this.modService
      .mod()
      .stems.filter(
        (s) => s._hasEffect && !['Attribute', 'Mood'].includes(s.name),
      );

    const baseSpells = this.modService
      .mod()
      .stems.filter((s) => s._hasSpell && !s._hasEffect);

    const baseEffectListToSort = [
      ...baseEffectList,
      ...baseEffects.map((e) => ({
        value: e._gameId,
        desc: e.all.desc,
      })),
      ...baseSpells.map((e) => ({
        value: e._gameId,
        desc: e.all.desc,
      })),
    ];

    const additionalEffectFromSTEM = this.additionalEffectFromSTEM();
    if (additionalEffectFromSTEM) {
      baseEffectListToSort.push({
        value: additionalEffectFromSTEM._gameId,
        desc: additionalEffectFromSTEM.all.desc,
      });
    }

    return sortBy(baseEffectListToSort, 'value');
  });

  constructor() {
    effect(() => {
      const defaultItem = this.defaultValue();
      if (defaultItem) {
        const foundItem = this.values().find((i) => i.value === defaultItem);
        this.effect.set(foundItem as unknown as { value: string });
      }
    });
  }

  public itemCompare(
    itemA: { value: string; desc: string },
    itemB: { value: string; desc: string },
  ): boolean {
    return itemA.value === itemB.value;
  }

  public search(term: string, item: { value: string }) {
    return item.value.toLowerCase().includes(term.toLowerCase());
  }
}
