import {
  AlignmentType,
  AllegianceType,
  BaseClassType,
  DamageClassType,
  HostilityType,
  ItemSlot,
  MonsterClassType,
  RandomNumber,
  Rollable,
  Skill,
  SkillBlock,
  Stat,
  StatBlock,
  StatType,
} from './building-blocks';
import { HasIdentification } from './identified';

export enum NPCTriggerType {
  Spawn = 'spawn',
  Leash = 'leash',
  Combat = 'combat',
}

export interface INPCEffect {
  name: string;
  endsAt: number;
  extra: {
    potency: number;
    damageType?: DamageClassType;
    enrageTimer?: number;
  };
}

export interface INPCDefinition extends HasIdentification {
  npcId: string;

  // the sprite or sprites this creature can be
  sprite: number[];

  // the npc name - optional - if unspecified, generated randomly
  name?: string;

  // the npc "guild" that it belongs to
  affiliation?: string;

  // the alignment of this npc
  alignment?: AlignmentType;

  // the allegiance of the npc - determines basic reps
  allegiance: AllegianceType;

  // the current reputation (how it views other allegiances)
  allegianceReputation: Record<AllegianceType, number>;

  // whether the npc can only use water
  aquaticOnly?: boolean;

  // whether the npc will avoid stepping in water
  avoidWater?: boolean;

  // the base class of the creature
  baseClass?: BaseClassType;

  // the base effects given to the creature (usually attributes/truesight/etc)
  baseEffects: INPCEffect[];

  // the drop chance for copying items that are already equipped
  copyDrops: Rollable[];

  // the drop pool for lairs that can drop X of Y items
  dropPool: {
    replace?: boolean;
    choose: {
      min: number;
      max: number;
    };
    items: Rollable[];
  };

  // stuff that can be put in the loot table for normal drops
  drops: Rollable[];

  // the hp multiplier for the npc
  hpMult: number;

  // extra properties pulled in from the map, varies depending on the NPC
  extraProps?: any;

  // the AI to force on this creature
  forceAI?: string;

  // gear items that can spawn on the creature
  items: {
    equipment: Record<ItemSlot, Rollable[]>;
    sack: Rollable[];
    belt: Rollable[];
  };

  // the creatures level
  level: number;

  // the creature class (used for rippers, etc)
  monsterClass?: MonsterClassType;

  // the monster grouping, so Hostility.Always dont infight with themselves
  monsterGroup?: string;

  // the "other stats" for this npc, inherited from NPC definition
  otherStats: Partial<Record<StatType, number>>;

  // how hostile the creature is (default: always)
  hostility: HostilityType;

  // the base hp/mp/gold/xp for the creature
  hp: RandomNumber;
  mp: RandomNumber;
  gold: RandomNumber;
  giveXp: RandomNumber;

  // whether the creature should avoid dropping a corpse
  noCorpseDrop?: boolean;

  // whether the creature should avoid dropping items
  noItemDrop?: boolean;

  // the reputation modifications for the killer when this npc is killed
  repMod: Array<{ allegiance: AllegianceType; delta: number }>;

  // the amount of skill gained by the party when this creature is killed
  skillOnKill: number;

  skillLevels: number;

  // the skills this creature has
  skills: SkillBlock;

  // the stats this creature has
  stats: StatBlock;

  // the modifiers (based on potency) for each stat to modify this character by
  summonStatModifiers: Partial<Record<Stat, number>>;

  // the modifiers (based on potency) for each skill to modify this character by
  summonSkillModifiers: Partial<Record<Skill, number>>;

  // the skill required to tan this creature
  tanSkillRequired?: number;

  // the item this creature tans for
  tansFor?: string;

  // the trait levels this creature has
  traitLevels: Record<string, number>;

  // npc triggers
  triggers: Record<
    NPCTriggerType,
    {
      messages: string[];
      sfx: {
        name: string;
        radius: number;
        maxChance: number;
      };
    }
  >;

  // npc usable skills
  usableSkills: Rollable[];

  // automatically given to green npcs, their forced x-coordinate
  x?: number;

  // automatically given to green npcs, their forced y-coordinate
  y?: number;

  // the challenge rating of the creature - scales the hp / damageFactor
  cr: number;
}
