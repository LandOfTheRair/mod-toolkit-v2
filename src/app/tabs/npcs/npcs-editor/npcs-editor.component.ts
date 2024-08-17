import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { isNumber } from 'lodash';
import {
  Allegiance,
  AllegianceType,
  IItemDefinition,
  INPCDefinition,
  ItemSlotType,
  SkillType,
  StatType,
} from '../../../../interfaces';
import { ElectronService } from '../../../services/electron.service';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
  selector: 'app-npcs-editor',
  templateUrl: './npcs-editor.component.html',
  styleUrl: './npcs-editor.component.scss',
})
export class NpcsEditorComponent
  extends EditorBaseComponent<INPCDefinition>
  implements OnInit
{
  private electronService = inject(ElectronService);

  public readonly key = 'npcs';
  public readonly tabs = [
    { name: 'Core Stats' },
    { name: 'Traits, Spells & Attributes' },
    { name: 'Gear' },
    { name: 'Drops' },
    { name: 'Triggers' },
    { name: 'Faction Reputation & Summonability' },
  ];

  public readonly coreProps: Array<{
    name: string;
    prop: keyof INPCDefinition;
  }> = [
    { name: 'HP', prop: 'hp' },
    { name: 'MP', prop: 'mp' },
    { name: 'XP', prop: 'giveXp' },
    { name: 'Gold', prop: 'gold' },
  ];

  public readonly statOrder: StatType[] = [
    'str',
    'dex',
    'agi',
    'int',
    'wis',
    'wil',
    'con',
    'cha',
    'luk',
  ];

  public equipmentColumns: Array<Array<ItemSlotType>> = [
    ['rightHand', 'leftHand', 'armor', 'robe1', 'robe2'],
    ['head', 'neck', 'waist', 'wrists', 'hands', 'feet'],
    ['ear', 'ring1', 'ring2', 'trinket', 'potion', 'ammo'],
  ];

  public allegiances = Object.values(Allegiance).sort();

  public currentStat = signal<StatType | undefined>(undefined);
  public currentSummonStat = signal<StatType | undefined>(undefined);
  public currentSummonSkill = signal<SkillType | undefined>(undefined);
  public currentTrait = signal<string | undefined>(undefined);
  public tansFor = signal<IItemDefinition | undefined>(undefined);

  public statsInOrder = computed(() => {
    const npc = this.editing();
    return Object.keys(npc.otherStats ?? {}).sort() as StatType[];
  });

  public summonStatsInOrder = computed(() => {
    const npc = this.editing();
    return Object.keys(npc.summonStatModifiers ?? {}).sort() as StatType[];
  });

  public summonSkillsInOrder = computed(() => {
    const npc = this.editing();
    return Object.keys(npc.summonSkillModifiers ?? {}).sort() as SkillType[];
  });

  public traitsInOrder = computed(() => {
    const npc = this.editing();
    return Object.keys(npc.traitLevels ?? {}).sort();
  });

  public linkStats = signal<boolean>(true);

  public canSave = computed(() => {
    const data = this.editing();
    return data.npcId && this.satisfiesUnique();
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<INPCDefinition>(
      'npcs',
      'npcId',
      data.npcId,
      data._id
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  private challengeData = computed(() => this.modService.json()['challenge']);

  constructor() {
    super();
    this.electronService.requestJSON('challenge');

    effect(() => {
      const data = this.challengeData();
      if (!data) return;

      this.changeCRStats();
    });
  }

  ngOnInit(): void {
    this.checkLinkedStats();
    const npc = this.editing();

    const reps = npc.repMod ?? [];
    npc.repMod = this.allegiances.map((allegiance) => ({
      allegiance,
      delta: reps.find((r) => r.allegiance === allegiance)?.delta ?? 0,
    }));

    if (!npc.triggers) (npc as any).triggers = {};

    ['leash', 'spawn', 'combat'].forEach((type) => {
      const triggerType = type as keyof INPCDefinition['triggers'];

      npc.triggers[triggerType] ??= {
        messages: [''],
        sfx: {
          name: undefined as unknown as string,
          radius: 6,
          maxChance: 0,
        },
      };

      npc.triggers[triggerType].messages ??= [''];

      npc.triggers[triggerType].sfx ??= {
        name: undefined as unknown as string,
        radius: 6,
        maxChance: 0,
      };

      if (type === 'combat') {
        npc.triggers[triggerType].messages =
          npc.triggers[triggerType].messages.filter(Boolean);
      }
    });

    this.editing.set(npc);

    super.ngOnInit();
  }

  public addTrait(trait: string | undefined, value = 0) {
    if (!trait) return;

    this.editing.update((npc) => ({
      ...npc,
      traitLevels: { ...npc.traitLevels, [trait]: value },
    }));
  }

  public removeTrait(trait: string) {
    this.editing.update((npc) => {
      const newNpc = { ...npc };
      delete npc.traitLevels[trait];
      return newNpc;
    });
  }

  public hasTrait(trait: string | undefined) {
    if (!trait) return;
    return isNumber(this.editing().traitLevels[trait]);
  }

  public addStat(stat: StatType | undefined, value = 0) {
    if (!stat) return;

    this.editing.update((npc) => ({
      ...npc,
      otherStats: { ...npc.otherStats, [stat]: value },
    }));
  }

  public removeStat(stat: StatType) {
    this.editing.update((npc) => {
      const newNpc = { ...npc };
      delete npc.otherStats[stat];
      return newNpc;
    });
  }

  public hasStat(stat: StatType | undefined) {
    if (!stat) return false;
    return isNumber(this.editing().otherStats[stat]);
  }

  public addSummonStat(stat: StatType | undefined, value = 0) {
    if (!stat) return;

    this.editing.update((npc) => ({
      ...npc,
      summonStatModifiers: { ...npc.summonStatModifiers, [stat]: value },
    }));
  }

  public removeSummonStat(stat: StatType) {
    this.editing.update((npc) => {
      const newNpc = { ...npc };
      delete npc.summonStatModifiers[stat];
      return newNpc;
    });
  }

  public hasSummonStat(stat: StatType | undefined) {
    if (!stat) return false;
    return isNumber(this.editing().summonStatModifiers[stat]);
  }

  public addSummonSkill(skill: SkillType | undefined, value = 0) {
    if (!skill) return;

    this.editing.update((npc) => ({
      ...npc,
      summonSkillModifiers: { ...npc.summonSkillModifiers, [skill]: value },
    }));
  }

  public removeSummonSkill(skill: SkillType) {
    this.editing.update((npc) => {
      const newNpc = { ...npc };
      delete npc.summonSkillModifiers[skill];
      return newNpc;
    });
  }

  public hasSummonSkill(skill: SkillType | undefined) {
    if (!skill) return false;
    return isNumber(this.editing().summonSkillModifiers[skill]);
  }

  public addSprite() {
    this.update('sprite', [...this.editing().sprite, 0]);
  }

  public removeSprite(index: number) {
    const spriteArr = this.editing().sprite;
    spriteArr.splice(index, 1);

    this.update('sprite', spriteArr);
  }

  public addSpell() {
    const npc = this.editing();
    npc.usableSkills.push({
      result: undefined as unknown as string,
      chance: 1,
    });
    this.editing.set(npc);
  }

  public removeSpell(index: number) {
    const npc = this.editing();
    npc.usableSkills.splice(index, 1);
    this.editing.set(npc);
  }

  public addBaseEffect() {
    const npc = this.editing();
    npc.baseEffects.push({
      endsAt: -1,
      name: undefined as unknown as string,
      extra: {
        potency: 1,
        damageType: undefined,
        enrageTimer: undefined,
      },
    });
    this.editing.set(npc);
  }

  public removeBaseEffect(index: number) {
    const npc = this.editing();
    npc.baseEffects.splice(index, 1);
    this.editing.set(npc);
  }

  public changeCRStats() {
    const npc = this.editing();
    const challengeData = this.challengeData();

    const level = npc.level;
    npc.hp = structuredClone(challengeData.global.stats.hp[level]);
    npc.mp = structuredClone(challengeData.global.stats.mp[level]);
    npc.giveXp = structuredClone(challengeData.global.stats.giveXp[level]);
    npc.gold = structuredClone(challengeData.global.stats.gold[level]);

    npc.hp.min = Math.floor(npc.hp.min * npc.hpMult);
    npc.hp.max = Math.floor(npc.hp.max * npc.hpMult);

    this.editing.set(npc);
  }

  public updateStatsIfLinked(statValue: number) {
    if (!this.linkStats()) return;

    this.statOrder.forEach((stat) => {
      this.editing.update((d) => {
        d.stats[stat] = statValue;
        return d;
      });
    });
  }

  private checkLinkedStats() {
    const stats = this.editing().stats;
    const firstStat = stats[this.statOrder[0]];
    const isLinked = this.statOrder.every((s) => stats[s] === firstStat);
    this.linkStats.set(isLinked);
  }

  public addSackItem() {
    const npc = this.editing();
    npc.items.sack.push({
      chance: -1,
      maxChance: 100,
      result: undefined as unknown as string,
    });

    this.editing.set(npc);
  }

  public removeSackItem(index: number) {
    const npc = this.editing();
    npc.items.sack.splice(index, 1);
    this.editing.set(npc);
  }

  public addEquipmentItem(slot: ItemSlotType) {
    const npc = this.editing();
    npc.items.equipment[slot].push({
      chance: 1,
      result: undefined as unknown as string,
    });

    this.editing.set(npc);
  }

  public removeEquipmentItem(slot: ItemSlotType, index: number) {
    const npc = this.editing();
    npc.items.equipment[slot].splice(index, 1);
    this.editing.set(npc);
  }

  public addDrop() {
    const npc = this.editing();
    npc.drops.push({
      chance: 1,
      result: undefined as unknown as string,
    });
    this.editing.set(npc);
  }

  public removeDrop(index: number) {
    const npc = this.editing();
    npc.drops.splice(index, 1);
    this.editing.set(npc);
  }

  public addCopyDrop() {
    const npc = this.editing();
    npc.copyDrops.push({
      chance: -1,
      result: undefined as unknown as string,
    });
    this.editing.set(npc);
  }

  public removeCopyDrop(index: number) {
    const npc = this.editing();
    npc.copyDrops.splice(index, 1);
    this.editing.set(npc);
  }

  public addDropPoolItem() {
    const npc = this.editing();
    npc.dropPool.items.push({
      chance: 1,
      result: undefined as unknown as string,
    });
    this.editing.set(npc);
  }

  public removeDropPoolItem(index: number) {
    const npc = this.editing();
    npc.dropPool.items.splice(index, 1);
    this.editing.set(npc);
  }

  public addCombatMessage() {
    const npc = this.editing();
    npc.triggers.combat.messages.push('');
    this.editing.set(npc);
  }

  public removeCombatMessage(index: number) {
    const npc = this.editing();
    npc.triggers.combat.messages.splice(index, 1);
    this.editing.set(npc);
  }

  public setReputation(allegiance: AllegianceType, number = 0) {
    const npc = this.editing();
    npc.allegianceReputation[allegiance] = number;
    this.editing.set(npc);
  }

  doSave() {
    const npc = this.editing();
    npc.usableSkills = npc.usableSkills.filter((f) => f.result);
    npc.baseEffects = npc.baseEffects.filter((f) => f.name);
    npc.items.sack = npc.items.sack.filter((f) => f.result);

    (this.equipmentColumns.flat(Infinity) as ItemSlotType[]).forEach(
      (slot: ItemSlotType) => {
        npc.items.equipment[slot] = npc.items.equipment[slot].filter(
          (f) => f.result
        );
      }
    );

    npc.drops = npc.drops.filter((d) => d.result);
    npc.copyDrops = npc.copyDrops.filter((d) => d.result);
    npc.dropPool.items = npc.dropPool.items.filter((d) => d.result);

    npc.repMod = npc.repMod.filter((r) => r.delta);

    ['leash', 'spawn', 'combat'].forEach((type) => {
      const triggerType = type as keyof INPCDefinition['triggers'];

      npc.triggers[triggerType].messages =
        npc.triggers[triggerType].messages.filter(Boolean);

      if (!npc.triggers[triggerType].sfx.name) {
        delete (npc.triggers[triggerType] as any).sfx;
      }

      if (!npc.triggers[triggerType].messages.length) {
        delete (npc.triggers[triggerType] as any).messages;
      }

      if (
        !npc.triggers[triggerType].messages &&
        !npc.triggers[triggerType].sfx
      ) {
        delete (npc.triggers as any)[triggerType];
      }
    });

    if (Object.keys(npc.triggers ?? {}).length === 0) {
      delete (npc as any).triggers;
    }

    this.editing.set(npc);

    super.doSave();
  }
}
