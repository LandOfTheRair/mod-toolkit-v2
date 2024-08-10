import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { isNumber, sortBy } from 'lodash';
import { INPCDefinition, StatType } from '../../../../interfaces';
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

  public currentStat = signal<StatType | undefined>(undefined);
  public currentTrait = signal<string | undefined>(undefined);

  public statsInOrder = computed(() => {
    const npc = this.editing();
    return sortBy(Object.keys(npc.otherStats)) as StatType[];
  });

  public traitsInOrder = computed(() => {
    const npc = this.editing();
    return sortBy(Object.keys(npc.traitLevels));
  });

  public linkStats = signal<boolean>(true);

  public canSave = computed(() => {
    const data = this.editing();
    return data.npcId;
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

  public addTrait(trait: string | undefined, value = 0) {
    if (!trait) return;

    const npc = structuredClone(this.editing());
    npc.traitLevels[trait] = value;
    this.editing.set(npc);
  }

  public removeTrait(trait: string) {
    const npc = structuredClone(this.editing());
    delete npc.traitLevels[trait];
    this.editing.set(npc);
  }

  public hasTrait(trait: string | undefined) {
    if (!trait) return;
    return isNumber(this.editing().traitLevels[trait]);
  }

  public addStat(stat: StatType, value = 0) {
    const npc = structuredClone(this.editing());
    npc.otherStats[stat] = value;
    this.editing.set(npc);
  }

  public removeStat(stat: StatType) {
    const npc = structuredClone(this.editing());
    delete npc.otherStats[stat];
    this.editing.set(npc);
  }

  public hasStat(stat: StatType) {
    return isNumber(this.editing().otherStats[stat]);
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

  ngOnInit(): void {
    this.checkLinkedStats();
    super.ngOnInit();
  }

  doSave() {
    const npc = this.editing();
    npc.usableSkills = npc.usableSkills.filter((f) => f.result);
    npc.baseEffects = npc.baseEffects.filter((f) => f.name);
    this.editing.set(npc);

    super.doSave();
  }
}
