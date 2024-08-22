import { Component, computed, input, model, signal } from '@angular/core';
import { isNumber } from 'lodash';
import { StatType } from '../../../../interfaces';

@Component({
  selector: 'app-edit-statobject',
  templateUrl: './edit-statobject.component.html',
  styleUrl: './edit-statobject.component.scss',
})
export class EditStatobjectComponent {
  public statObject = model.required<Partial<Record<StatType, number>>>();
  public allowCore = input<boolean>(true);

  public currentStat = signal<StatType>('agi');

  public statsInOrder = computed(() => {
    const stats = this.statObject() ?? {};
    return Object.keys(stats).sort() as StatType[];
  });

  public doesObjectHaveCurrentStat = computed(() => {
    const current = this.currentStat();
    return isNumber(this.statObject()?.[current]);
  });

  addStat(stat: StatType, value = 0) {
    if (this.hasStat(stat)) return;

    this.statObject.update((editing) => {
      return {
        ...editing,
        [stat]: value,
      };
    });
  }

  removeStat(stat: StatType) {
    this.statObject.update((s) => {
      delete s[stat];

      return structuredClone(s);
    });
  }

  hasStat(stat: StatType) {
    return this.statObject()?.[stat];
  }
}
