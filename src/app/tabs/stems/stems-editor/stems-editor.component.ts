import { Component, computed, OnInit, signal } from '@angular/core';
import { isBoolean, isNumber, isString } from 'lodash';
import { StatType } from '../../../../interfaces';
import { ISTEM } from '../../../../interfaces/stem';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

/**
 * TODO: rules
 *
 * spell:
 * - spell.spellName = spellName || stemKey
 * - spell.spellMeta ??= {}
 * - spell.spellMeta.spellRef = spell.spellMeta.spellRef || stemKey
 * - spell.mpCost ??= 0
 * - spell.maxSkillForGain ??= 1;
 *
 * trait:
 * - trait.spellGiven = spellGiven || stemKey
 * - trait.name = trait.name || all.name
 * - trait.icon = trait.icon || all.icon
 * - trait.desc = trait.desc || all.desc
 * - trait.iconColor = trait.iconColor || all.iconColor
 * - trait.iconBgColor = trait.iconBgColor || all.bgColor
 * - ancient traits have set iconbgcolor to #aa5c39
 *
 * effect:
 * - effect.tooltip.icon = icon || all.icon
 * - effect.tooltip.color = color || all.color
 * - effect.tooltip.bgColor = bgColor || all.bgColor
 * - effect.tooltip.desc = desc || all.desc
 * - effect.effectMeta ??= {}
 * - effect.tooltip ??= {}
 * - effect.extra ??= {}
 * - effect.extra.potency ??= 0
 * - effect.duration ??= 0
 *
 * macro:
 * - macro.name = name || stemKey
 * - macro.for = for || stemKey
 * - macro.macro = macro || cast stemKey.toLowerCase()
 * - macro.icon = icon || all.icon
 * - macro.color = color || all.color
 * - macro.bgColor = bgColor || all.bgColor
 * - macro.tooltipDesc = tooltipDesc || all.desc
 */

@Component({
  selector: 'app-stems-editor',
  templateUrl: './stems-editor.component.html',
  styleUrl: './stems-editor.component.scss',
})
export class StemsEditorComponent
  extends EditorBaseComponent<ISTEM>
  implements OnInit
{
  public readonly key = 'stems';
  public readonly tabs = [
    { name: 'Global Settings', visibleIf: computed(() => true) },
    { name: '[S]pell', visibleIf: computed(() => this.editing()._hasSpell) },
    { name: '[T]rait', visibleIf: computed(() => this.editing()._hasTrait) },
    { name: '[E]ffect', visibleIf: computed(() => this.editing()._hasEffect) },
    { name: '[M]acro', visibleIf: computed(() => this.editing()._hasMacro) },
  ];

  public readonly effectUniqueTabs = [
    { name: 'None', type: 'none', setTo: undefined },
    { name: 'Buff Only', type: 'boolean', setTo: true },
    { name: 'Spell Class', type: 'string', setTo: '' },
  ];

  public currentItem = signal<ISTEM | undefined>(undefined);
  public currentTraitStat = signal<StatType>('agi');
  public currentEffectStat = signal<StatType>('agi');

  public canSave = computed(() => {
    const data = this.editing();
    return (
      this.satisfiesUniqueGameId() &&
      this.satisfiesUniqueName() &&
      data.name &&
      data._gameId &&
      (data._hasEffect || data._hasMacro || data._hasSpell || data._hasTrait)
    );
  });

  public satisfiesUniqueName = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<ISTEM>(
      'stems',
      'name',
      data.name,
      data._id
    );
  });

  public satisfiesUniqueGameId = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<ISTEM>(
      'stems',
      '_gameId',
      data._gameId,
      data._id
    );
  });

  public traitStatsInOrder = computed(() => {
    const item = this.editing();
    return Object.keys(item.trait?.statsGiven ?? {}).sort() as StatType[];
  });

  public doesItemHaveCurrentTraitStat = computed(() => {
    const current = this.currentTraitStat();
    return isNumber(this.editing().trait.statsGiven?.[current]);
  });

  public effectStatsInOrder = computed(() => {
    const item = this.editing();
    return Object.keys(
      item.effect.effect.extra?.statChanges ?? {}
    ).sort() as StatType[];
  });

  public doesItemHaveCurrentEffectStat = computed(() => {
    const current = this.currentEffectStat();
    return isNumber(this.editing().effect.effect.extra?.statChanges?.[current]);
  });

  public effectUniqueType = computed(() => {
    const item = this.editing();

    if (isString(item.effect.effect.extra.unique)) return 'string';
    if (isBoolean(item.effect.effect.extra.unique)) return 'boolean';

    return 'none';
  });

  ngOnInit(): void {
    super.ngOnInit();
  }

  checkAndUpdateGameId($event: string) {
    const item = this.editing();
    const oldStrippedName = item.name.split(' ').join('');
    const strippedName = $event.split(' ').join('');

    if (item._gameId && item._gameId !== oldStrippedName) return;
    item._gameId = strippedName;

    this.editing.set(item);
  }

  // trait functions
  toggleAncient() {
    const isAncient = this.editing().trait.isAncient;
    this.editing.update((editing) => {
      editing.trait.iconBgColor = isAncient ? '#aa5c39' : '';
      return editing;
    });
  }

  addTraitStat(stat: StatType, value = 0) {
    if (this.hasTraitStat(stat)) return;

    this.editing.update((s) => {
      return {
        ...s,
        trait: {
          ...s.trait,
          statsGiven: {
            ...s.trait.statsGiven,
            [stat]: value,
          },
        },
      };
    });
  }

  removeTraitStat(stat: StatType) {
    this.editing.update((s) => {
      delete s.trait.statsGiven?.[stat];

      return s;
    });
  }

  hasTraitStat(stat: StatType) {
    return this.editing().trait.statsGiven?.[stat];
  }

  // effect functions
  changeBuffType($event: string | undefined) {
    if (!$event) return;

    this.editing.update((editing) => {
      editing.effect.effect.extra.canRemove =
        $event === 'buff' || $event === 'outgoing';
      return editing;
    });
  }

  changeUniqueType(newType: string | boolean | undefined) {
    this.editing.update((editing) => {
      return {
        ...editing,
        effect: {
          ...editing.effect,
          effect: {
            ...editing.effect.effect,
            extra: {
              ...editing.effect.effect.extra,
              unique: newType,
            },
          },
        },
      };
    });
  }

  addEffectStat(stat: StatType, value = 0) {
    if (this.hasEffectStat(stat)) return;

    this.editing.update((editing) => {
      return {
        ...editing,
        effect: {
          ...editing.effect,
          effect: {
            ...editing.effect.effect,
            extra: {
              ...editing.effect.effect.extra,
              statChanges: {
                ...editing.effect.effect.extra.statChanges,
                [stat]: value,
              },
            },
          },
        },
      };
    });
  }

  removeEffectStat(stat: StatType) {
    this.editing.update((s) => {
      delete s.effect.effect.extra.statChanges?.[stat];

      return s;
    });
  }

  hasEffectStat(stat: StatType) {
    return this.editing().effect.effect.extra.statChanges?.[stat];
  }

  doSave() {
    const core = this.editing();

    this.editing.set(core);

    super.doSave();
  }
}
