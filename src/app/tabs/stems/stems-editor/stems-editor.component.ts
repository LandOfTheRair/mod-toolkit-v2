import { Component, computed, OnInit, signal } from '@angular/core';
import { isBoolean, isString } from 'lodash';
import { INPCDefinition, StatType } from '../../../../interfaces';
import { ISTEM } from '../../../../interfaces/stem';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

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
    {
      name: '[S]pell',
      visibleIf: computed(
        () => !this.editing()._isNPCOnly && this.editing()._hasSpell
      ),
    },
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
  public currentSpellNPC = signal<INPCDefinition | undefined>(undefined);
  public currentSpellFizzleEffect = signal<{ value: string } | undefined>(
    undefined
  );

  public canSave = computed(() => {
    const data = this.editing();
    return (
      this.satisfiesUniqueGameId() &&
      this.satisfiesUniqueName() &&
      data.name &&
      data._gameId &&
      (data._hasEffect ||
        data._hasMacro ||
        data._hasSpell ||
        data._hasTrait ||
        data._isNPCOnly)
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

  setSpellAttack($event: boolean) {
    if (!$event) return;

    const editing = this.editing();
    editing.spell = {
      ...editing.spell,
      spellMeta: {
        ...editing.spell.spellMeta,
        doesOvertime: false,
        doesHeal: false,
      },
    };

    this.editing.set(editing);
  }

  setSpellHeal($event: boolean) {
    if (!$event) return;

    const editing = this.editing();
    editing.spell = {
      ...editing.spell,
      spellMeta: {
        ...editing.spell.spellMeta,
        doesOvertime: false,
        doesAttack: false,
        noHostileTarget: true,
        noReflect: true,
      },
    };

    this.editing.set(editing);
  }

  setSpellOvertime($event: boolean) {
    if (!$event) return;

    const editing = this.editing();
    editing.spell = {
      ...editing.spell,
      spellMeta: {
        ...editing.spell.spellMeta,
        doesAttack: false,
        doesHeal: false,
      },
    };

    this.editing.set(editing);
  }

  addSpellPotencyMultiplier() {
    const editing = this.editing();
    editing.spell.skillMultiplierChanges.push([]);
    this.editing.set(editing);
  }

  removeSpellPotencyMultiplier(index: number) {
    const editing = this.editing();
    editing.spell.skillMultiplierChanges.splice(index, 1);
    this.editing.set(editing);
  }

  addSpellSummonNPC(npc: INPCDefinition | undefined) {
    if (!npc) return;

    const editing = this.editing();
    editing.spell.spellMeta.creatureSummoned.push(npc.npcId);
    this.editing.set(editing);
  }

  removeSpellSummonNPC(index: number) {
    const editing = this.editing();
    editing.spell.spellMeta.creatureSummoned.splice(index, 1);
    this.editing.set(editing);
  }

  hasSpellSummonNPC(npc: INPCDefinition | undefined): boolean {
    if (!npc) return false;
    return this.editing().spell.spellMeta.creatureSummoned.includes(npc.npcId);
  }

  sortSpellSummonNPCs(npcs: string[]): string[] {
    return npcs.sort();
  }

  addSpellFizzleEffect(effect: string | undefined) {
    if (!effect) return;

    const editing = this.editing();
    editing.spell.spellMeta.fizzledBy.push(effect);
    this.editing.set(editing);
  }

  removeSpellFizzleEffect(index: number) {
    const editing = this.editing();
    editing.spell.spellMeta.fizzledBy.splice(index, 1);
    this.editing.set(editing);
  }

  hasSpellFizzleEffect(effect: string | undefined): boolean {
    if (!effect) return false;
    return this.editing().spell.spellMeta.fizzledBy.includes(effect);
  }

  sortSpellFizzleEffects(effects: string[]): string[] {
    return effects.sort();
  }

  doSave() {
    const core = this.editing();

    this.editing.set(core);

    super.doSave();
  }
}
