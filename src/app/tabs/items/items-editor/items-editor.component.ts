import { Component, computed, OnInit, signal } from '@angular/core';
import { sortBy } from 'lodash';
import {
  IItemDefinition,
  ItemClassType,
  StatBlock,
  StatType,
} from '../../../../interfaces';
import {
  typePropDefaults,
  typePropPrimarySecondary,
  typePropSets,
} from '../../../helpers';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

type StatEdit = {
  stat: StatType;
  type: 'minmax' | 'set';
  min: number;
  max: number;
  set: number;
};

@Component({
  selector: 'app-items-editor',
  templateUrl: './items-editor.component.html',
  styleUrl: './items-editor.component.scss',
})
export class ItemsEditorComponent
  extends EditorBaseComponent<IItemDefinition>
  implements OnInit
{
  public readonly tabs = [
    { name: 'Core Stats' },
    { name: 'Traits, Effects & Requirements' },
    { name: 'Miscellaneous' },
  ];

  public currentStat = signal<StatType>('agi');
  public allStatEdits = signal<StatEdit[]>([]);

  public canSave = computed(() => {
    const data = this.editing();
    return data.name && data.itemClass;
  });

  public doesItemHaveCurrentStat = computed(() => {
    const current = this.currentStat();
    return this.allStatEdits().find((s) => s.stat === current);
  });

  public statsInOrder = computed(() => {
    return sortBy(this.allStatEdits(), 'stat');
  });

  public extraProps = computed(() => {
    return (
      typePropSets[this.editing().itemClass]?.filter((s) => s !== 'stats') ?? []
    );
  });

  ngOnInit() {
    this.extractStats(this.editing());
  }

  public changeItemClass(newItemClass: ItemClassType) {
    const oldItemClass = this.editing().itemClass;
    this.update('itemClass', newItemClass);

    const propChanges = typePropPrimarySecondary[newItemClass];
    if (propChanges) {
      this.update('type', propChanges.p);
      this.update('secondaryType', propChanges.s);
    }

    const oldPropSets = typePropSets[oldItemClass];
    if (oldPropSets) {
      oldPropSets.forEach((prop) => {
        if (prop === 'stats') {
          Object.keys(typePropDefaults[oldItemClass].stats).forEach(
            (statKey) => {
              this.removeStat(statKey as StatType);
            }
          );
          return;
        }

        this.update(prop as keyof IItemDefinition, undefined);
      });
    }

    const extraPropSets = typePropSets[newItemClass];
    if (extraPropSets) {
      extraPropSets.forEach((prop) => {
        if (prop === 'stats') {
          Object.keys(typePropDefaults[newItemClass].stats).forEach(
            (statKey) => {
              this.addStat(
                statKey as StatType,
                (typePropDefaults[newItemClass].stats as Partial<StatBlock>)[
                  statKey as StatType
                ]
              );
            }
          );
          return;
        }

        this.update(
          prop as keyof IItemDefinition,
          typePropDefaults[newItemClass][prop]
        );
      });
    }
  }

  public addStat(stat: StatType, value = 0) {
    if (this.hasStat(stat)) return;

    this.allStatEdits.update((s) => [
      ...s,
      { stat, type: 'set', set: value, min: 0, max: 0 },
    ]);
  }

  public removeStat(stat: StatType) {
    this.allStatEdits.set(this.allStatEdits().filter((s) => s.stat !== stat));
  }

  public toggleStat(stat: StatEdit) {
    stat.type = stat.type === 'set' ? 'minmax' : 'set';
  }

  private hasStat(stat: StatType) {
    return this.allStatEdits().find((s) => s.stat === stat);
  }

  private extractStats(item: IItemDefinition) {
    this.extractSetStats(item.stats);

    Object.keys(item.randomStats).forEach((statKey) => {
      const stat = statKey as StatType;
      const value = item.randomStats?.[stat] ?? { min: 0, max: 0 };
      this.allStatEdits.update((s) => [
        ...s,
        { stat, type: 'minmax', set: 0, ...value },
      ]);
    });
  }

  private extractSetStats(stats: StatBlock) {
    Object.keys(stats).forEach((statKey) => {
      const stat = statKey as StatType;
      this.allStatEdits.update((s) => [
        ...s,
        {
          stat,
          type: 'set',
          set: stats[stat] ?? 0,
          min: 0,
          max: 0,
        },
      ]);
    });
  }

  private assignStats(item: IItemDefinition) {
    item.stats = {};
    item.randomStats = {};

    this.allStatEdits().forEach((stat) => {
      if (stat.type === 'set') {
        item.stats[stat.stat] = stat.set;
      }

      if (stat.type === 'minmax') {
        item.randomStats[stat.stat] = { min: stat.min, max: stat.max };
      }
    });
  }

  public doSave() {
    const item = this.editing();
    this.assignStats(item);
    super.doSave();
  }
}
