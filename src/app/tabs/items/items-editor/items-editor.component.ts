import { Component, computed, OnInit, Signal, signal } from '@angular/core';
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
  public readonly key = 'items';
  public readonly tabs = [
    { name: 'Core Stats' },
    { name: 'Traits, Effects & Requirements' },
    { name: 'Miscellaneous' },
  ];

  public readonly propTypes: Partial<
    Record<
      keyof IItemDefinition,
      | 'number'
      | 'boolean'
      | 'string'
      | 'damageClass'
      | 'succorInfo'
      | 'containedItems'
    >
  > = {
    tier: 'number',
    shots: 'number',
    proneChance: 'number',
    attackRange: 'number',
    isHeavy: 'boolean',
    twoHanded: 'boolean',
    offhand: 'boolean',
    returnsOnThrow: 'boolean',
    canShoot: 'boolean',
    ounces: 'number',
    bookPages: 'number',
    bookFindablePages: 'number',
    bookItemFilter: 'string',
    trapUses: 'number',
    damageClass: 'damageClass',
    succorInfo: 'succorInfo',
    containedItems: 'containedItems',
  };

  public currentItem = signal<IItemDefinition | undefined>(undefined);
  public currentStat = signal<StatType>('agi');
  public allStatEdits = signal<StatEdit[]>([]);

  public canSave = computed(() => {
    const data = this.editing();
    return data.name && data.itemClass && this.satisfiesUnique();
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<IItemDefinition>(
      'items',
      'name',
      data.name,
      data._id
    );
  });

  public doesItemHaveCurrentStat = computed(() => {
    const current = this.currentStat();
    return this.allStatEdits().find((s) => s.stat === current);
  });

  public statsInOrder = computed(() => {
    return sortBy(this.allStatEdits(), 'stat');
  });

  public extraProps: Signal<(keyof IItemDefinition)[]> = computed(() => {
    return (typePropSets[this.editing().itemClass]
      ?.filter((s) => s !== 'stats')
      .sort() ?? []) as unknown as (keyof IItemDefinition)[];
  });

  ngOnInit() {
    this.extractStats(this.editing());
    this.resetProps(this.editing());
    this.addItemClassMissingProps(this.editing().itemClass);

    super.ngOnInit();
  }

  private resetProps(item: IItemDefinition) {
    item.strikeEffect ??= { name: '', potency: 0, duration: 0, chance: 0 };
    item.useEffect ??= { name: '', potency: 0, duration: 0 };
    item.equipEffect ??= { name: '', potency: 0 };
    item.breakEffect ??= { name: '', potency: 0 };
    item.requirements ??= { baseClass: undefined, level: 0 };
    item.cosmetic ??= { name: '', isPermanent: false };

    this.editing.set(item);
  }

  public changeItemClass(newItemClass: ItemClassType) {
    const oldItemClass = this.editing().itemClass;
    this.update('itemClass', newItemClass);

    const propChanges = typePropPrimarySecondary[newItemClass];
    if (propChanges) {
      this.update('type', propChanges.p);
      this.update('secondaryType', propChanges.s);
    }

    this.removeOldItemClassMissingProps(oldItemClass);
    this.addItemClassMissingProps(newItemClass);
  }

  private removeOldItemClassMissingProps(oldItemClass: ItemClassType) {
    const oldPropSets = typePropSets[oldItemClass];
    if (oldPropSets) {
      oldPropSets.forEach((prop) => {
        if (prop === 'containedItems') {
          return;
        }
        if (prop === 'succorInfo') {
          this.editing.update((i) => {
            delete i.succorInfo;
            return i;
          });
          return;
        }
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
  }

  private addItemClassMissingProps(newItemClass: ItemClassType) {
    const extraPropSets = typePropSets[newItemClass];
    if (extraPropSets) {
      extraPropSets.forEach((prop) => {
        if (prop === 'containedItems') {
          return;
        }
        if (prop === 'succorInfo') {
          if (this.editing().succorInfo) return;

          this.editing.update((i) => ({
            ...i,
            succorInfo: { map: '', x: 0, y: 0 },
          }));
          return;
        }
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

  public addContainedItem() {
    const addItem = this.currentItem();
    if (!addItem) return;

    const item = this.editing();
    item.containedItems ??= [];

    item.containedItems.push({
      chance: 1,
      result: addItem.name,
    });

    this.editing.set(item);
  }

  public removeContainedItem(index: number) {
    const item = this.editing();

    item.containedItems?.splice(index, 1);

    this.editing.set(item);
  }

  private cleanUpItem(item: IItemDefinition) {
    if (item.succorInfo) {
      if (!item.succorInfo.map) {
        delete item.succorInfo;
      }
    }

    if (item.containedItems) {
      if (item.containedItems.length === 0) {
        delete item.containedItems;
      }
    }

    if (item.strikeEffect && !item.strikeEffect.name) {
      delete item.strikeEffect;
    }

    if (item.useEffect && !item.useEffect.name) {
      delete item.useEffect;
    }

    if (item.equipEffect && !item.equipEffect.name) {
      delete item.equipEffect;
    }

    if (item.breakEffect && !item.breakEffect.name) {
      delete item.breakEffect;
    }

    if (
      item.requirements &&
      !item.requirements.baseClass &&
      !item.requirements.level
    ) {
      delete item.requirements;
    }

    if (item.cosmetic && !item.cosmetic.name) {
      delete item.cosmetic;
    }
  }

  public doSave() {
    const item = this.editing();
    this.assignStats(item);
    this.cleanUpItem(item);
    this.editing.set(item);

    super.doSave();
  }
}
