import { Component, computed, OnInit, Signal, signal } from '@angular/core';
import { isNumber, sortBy } from 'lodash';
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

type TraitSetting = 'none' | 'static' | 'random';

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

  public readonly traitSettings: Array<{ name: string; type: TraitSetting }> = [
    { name: 'No Trait', type: 'none' },
    { name: 'Single Trait', type: 'static' },
    { name: 'Random Trait', type: 'random' },
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
      | 'recipe'
      | 'bookPages'
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
    bookPage: 'number',
    bookPages: 'bookPages',
    bookFindablePages: 'number',
    bookItemFilter: 'string',
    trapUses: 'number',
    canUpgradeWith: 'boolean',
    damageClass: 'damageClass',
    succorInfo: 'succorInfo',
    containedItems: 'containedItems',
    recipe: 'recipe',
  };

  public currentItem = signal<IItemDefinition | undefined>(undefined);
  public currentStat = signal<StatType>('agi');
  public currentEncrustStat = signal<StatType>('agi');
  public currentNourishmentStat = signal<StatType>('agi');
  public currentTraitTab = signal<TraitSetting>('none');
  public currentTrait = signal<string | undefined>(undefined);
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

  public doesItemHaveCurrentEncrustStat = computed(() => {
    const current = this.currentEncrustStat();
    return isNumber(this.editing().encrustGive?.stats[current]);
  });

  public doesItemHaveCurrentNourishmentStat = computed(() => {
    const current = this.currentNourishmentStat();
    return isNumber(this.editing().useEffect?.extra?.statChanges?.[current]);
  });

  public statsInOrder = computed(() => {
    return sortBy(this.allStatEdits(), 'stat');
  });

  public encrustStatsInOrder = computed(() => {
    const item = this.editing();
    return Object.keys(item.encrustGive?.stats ?? {}).sort() as StatType[];
  });

  public nourishmentStatsInOrder = computed(() => {
    const item = this.editing();
    return Object.keys(
      item.useEffect?.extra?.statChanges ?? {}
    ).sort() as StatType[];
  });

  public extraProps: Signal<(keyof IItemDefinition)[]> = computed(() => {
    return (typePropSets[this.editing().itemClass]
      ?.filter((s) => s !== 'stats')
      .sort() ?? []) as unknown as (keyof IItemDefinition)[];
  });

  ngOnInit() {
    this.resetProps(this.editing());
    this.extractStats(this.editing());
    this.addItemClassMissingProps(this.editing().itemClass);

    super.ngOnInit();
  }

  private resetProps(item: IItemDefinition) {
    item.strikeEffect ??= { name: '', potency: 0, duration: 0, chance: 0 };
    item.useEffect ??= {
      name: '',
      potency: 0,
      duration: 0,
    };
    item.useEffect.extra ??= { tooltip: '', message: '', statChanges: {} };
    item.equipEffect ??= { name: '', potency: 0 };
    item.breakEffect ??= { name: '', potency: 0 };
    item.trapEffect ??= {
      name: '',
      potency: 0,
      uses: 1,
      range: 0,
    };
    item.trapEffect.extra ??= { isPositive: false };

    item.requirements ??= { baseClass: undefined, level: 0, quest: undefined };
    item.cosmetic ??= { name: '', isPermanent: false };
    item.trait ??= { name: '', level: 0 };
    item.randomTrait ??= { name: [], level: { min: 0, max: 0 } };

    item.encrustGive ??= {
      slots: [],
      stats: {},
    };

    item.encrustGive.strikeEffect ??= {
      name: '',
      potency: 0,
      chance: 0,
    };

    item.bookPages ??= [];

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
        if (prop === 'recipe') return;

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

  public addEncrustStat(stat: StatType, value = 0) {
    if (this.hasEncrustStat(stat)) return;

    this.editing.update((s) => {
      if (!s.encrustGive) return s;

      return {
        ...s,
        encrustGive: {
          ...s.encrustGive,
          stats: {
            ...s.encrustGive.stats,
            [stat]: value,
          },
        },
      };
    });
  }

  public removeEncrustStat(stat: StatType) {
    this.editing.update((s) => {
      if (!s.encrustGive) return s;

      delete s.encrustGive.stats[stat];

      return s;
    });
  }

  private hasEncrustStat(stat: StatType) {
    return this.editing().encrustGive?.stats?.[stat];
  }

  public addNourishmentStat(stat: StatType, value = 0) {
    if (this.hasNourishmentStat(stat)) return;

    this.editing.update((s) => {
      if (!s.useEffect) return s;

      return {
        ...s,
        useEffect: {
          ...s.useEffect,
          extra: {
            ...s.useEffect.extra,
            statChanges: {
              ...(s.useEffect.extra?.statChanges ?? {}),
              [stat]: value,
            },
          },
        },
      };
    });
  }

  public removeNourishmentStat(stat: StatType) {
    this.editing.update((s) => {
      if (!s.encrustGive) return s;

      delete s.encrustGive.stats[stat];

      return s;
    });
  }

  private hasNourishmentStat(stat: StatType) {
    return this.editing().useEffect?.extra?.statChanges?.[stat];
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

    if (item.trait.name) {
      this.currentTraitTab.set('static');
    }

    if (item.randomTrait.name.length > 0) {
      this.currentTraitTab.set('random');
    }
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

    if (
      item.useEffect &&
      item.useEffect.extra &&
      !item.useEffect.extra.tooltip
    ) {
      delete item.useEffect.extra;
    }

    if (
      item.useEffect &&
      item.useEffect.extra &&
      !item.useEffect.extra.tooltip
    ) {
      delete item.useEffect.extra;
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

    if (item.trapEffect && !item.trapEffect.name) {
      delete item.trapEffect;
    }

    if (
      item.requirements &&
      !item.requirements.baseClass &&
      !item.requirements.level &&
      !item.requirements.quest
    ) {
      delete item.requirements;
    }

    if (item.cosmetic && !item.cosmetic.name) {
      delete item.cosmetic;
    }

    if (item.encrustGive) {
      if (!item.encrustGive.strikeEffect?.name) {
        delete item.encrustGive.strikeEffect;
      }

      if (item.encrustGive.slots.length === 0) {
        delete item.encrustGive;
      }
    }

    if (!item.bookPages?.length) {
      delete item.bookPages;
    }
  }

  changeTraitTab(newTraitSetting: TraitSetting) {
    this.currentTraitTab.set(newTraitSetting);

    const item = this.editing();

    if (newTraitSetting !== 'random') {
      item.randomTrait = {
        name: [],
        level: { min: 0, max: 0 },
      };
    }

    if (newTraitSetting !== 'static') {
      item.trait = {
        name: undefined as unknown as string,
        level: 0,
      };
    }
  }

  addTrait(trait: string | undefined) {
    if (!trait) return;

    const item = this.editing();
    item.randomTrait.name.push(trait);

    this.editing.set(item);
  }

  hasTrait(trait: string | undefined) {
    if (!trait) return false;

    return this.editing().randomTrait.name.includes(trait);
  }

  removeTrait(index: number) {
    const item = this.editing();
    item.randomTrait.name.splice(index, 1);

    this.editing.set(item);
  }

  public addBookPage() {
    const item = this.editing();
    item.bookPages?.push({ id: '', text: '' });

    this.editing.set(item);
  }

  public removeBookPage(index: number) {
    const item = this.editing();
    item.bookPages?.splice(index, 1);

    this.editing.set(item);
  }

  public doSave() {
    const item = this.editing();
    this.assignStats(item);
    this.cleanUpItem(item);
    this.editing.set(item);

    super.doSave();
  }
}
