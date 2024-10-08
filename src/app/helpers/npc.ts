import {
  AlignmentType,
  BaseClassType,
  INPCDefinition,
  MonsterClassType,
} from '../../interfaces';
import { id } from './id';

export const defaultNPC: () => INPCDefinition = () => ({
  _id: id(),
  sprite: [0],
  npcId: '',
  name: '',
  hostility: 'OnHit',
  allegiance: 'Enemy',
  monsterClass: undefined as unknown as MonsterClassType,
  baseClass: undefined as unknown as BaseClassType,
  affiliation: '',
  alignment: 'Neutral' as AlignmentType,
  cr: 0,
  hpMult: 1,
  stats: {
    str: 0,
    dex: 0,
    agi: 0,
    int: 0,
    wis: 0,
    wil: 0,
    con: 0,
    cha: 0,
    luk: 0,
  },
  level: 1,
  skillLevels: 1,
  skillOnKill: 1,
  otherStats: {},
  hp: { min: 0, max: 0 },
  mp: { min: 0, max: 0 },
  giveXp: { min: 0, max: 0 },
  gold: { min: 0, max: 0 },
  monsterGroup: '',
  avoidWater: false,
  aquaticOnly: false,
  noCorpseDrop: false,
  noItemDrop: false,
  traitLevels: {},
  usableSkills: [],
  baseEffects: [],
  drops: [],
  copyDrops: [],
  dropPool: {
    choose: {
      min: 0,
      max: 0,
    },
    items: [],
  },
  tansFor: '',
  tanSkillRequired: 0,
  triggers: {
    leash: {
      messages: [''],
      sfx: {
        name: undefined as unknown as string,
        radius: 6,
        maxChance: 0,
      },
    },
    spawn: {
      messages: [''],
      sfx: {
        name: undefined as unknown as string,
        radius: 6,
        maxChance: 0,
      },
    },
    combat: {
      messages: [],
      sfx: {
        name: undefined as unknown as string,
        radius: 6,
        maxChance: 0,
      },
    },
  },
  items: {
    sack: [],
    belt: [],
    equipment: {
      rightHand: [],
      leftHand: [],
      head: [],
      neck: [],
      ear: [],
      waist: [],
      wrists: [],
      ring1: [],
      ring2: [],
      hands: [],
      feet: [],
      armor: [],
      robe1: [],
      robe2: [],
      trinket: [],
      potion: [],
      ammo: [],
    },
  },
  allegianceReputation: {
    Adventurers: 0,
    Enemy: 0,
    GM: 0,
    NaturalResource: 0,
    None: 0,
    Pirates: 0,
    Royalty: 0,
    Townsfolk: 0,
    Underground: 0,
    Wilderness: 0,
  },
  repMod: [],
  skills: {},
  summonSkillModifiers: {},
  summonStatModifiers: {},
});
