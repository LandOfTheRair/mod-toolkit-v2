import { isNumber, isString } from 'lodash';
import {
  AllegianceType,
  INPCDefinition,
  ItemSlot,
  Skill,
  SkillType,
} from '../../../interfaces';

const allSkills = Object.values(Skill);

const coreStats = {
  str: 0,
  dex: 0,
  agi: 0,
  int: 0,
  wis: 0,
  wil: 0,
  luk: 0,
  cha: 0,
  con: 0,
};

const otherStats = {
  move: 2,
  hpregen: 1,
  mpregen: 1,
  hp: 100,
  mp: 0,
  weaponDamageRolls: 0,
  weaponArmorClass: 0,
  armorClass: 0,
  accuracy: 0,
  offense: 0,
  defense: 0,
  stealth: 0,
  perception: 0,
  physicalDamageBoostPercent: 0,
  magicalDamageBoostPercent: 0,
  healingBoostPercent: 0,
  physicalDamageReflect: 0,
  magicalDamageReflect: 0,
  spellReflectChance: 0,
  necroticBoostPercent: 0,
  energyBoostPercent: 0,
  diseaseBoostPercent: 0,
  poisonBoostPercent: 0,
  waterBoostPercent: 0,
  iceBoostPercent: 0,
  fireBoostPercent: 0,
  mitigation: 0,
  magicalResist: 0,
  physicalResist: 0,
  necroticResist: 0,
  energyResist: 0,
  waterResist: 0,
  fireResist: 0,
  iceResist: 0,
  poisonResist: 0,
  diseaseResist: 0,

  actionSpeed: 1,
  damageFactor: 1,
};

export function levelFromSkillXP(skillXP: number): number {
  const skillValue = skillXP ?? 0;
  if (skillValue < 100) return 0;

  const value = Math.log((skillValue - 1) / 100) / Math.log(1.55); // -1 because for some reason level 1 displays as 2, fuck math or something?
  return 1 + Math.floor(value);
}

export function skillXPFromLevel(level: number): number {
  if (level === 0) return 100;

  return Math.floor(Math.pow(1.55, level) * 100);
}

const assignReputations = (npc: INPCDefinition) => {
  const antiReps: Record<AllegianceType, AllegianceType[]> = {
    None: ['Enemy'],
    Royalty: ['Townsfolk', 'Enemy'],
    Townsfolk: ['Pirates', 'Royalty', 'Enemy'],
    Adventurers: ['Pirates', 'Enemy'],
    Wilderness: ['Underground', 'Enemy'],
    Underground: ['Wilderness', 'Enemy'],
    Pirates: ['Adventurers', 'Townsfolk', 'Enemy'],
    Enemy: [
      'Royalty',
      'Townsfolk',
      'Adventurers',
      'Wilderness',
      'Underground',
      'Pirates',
      'None',
    ],
    NaturalResource: ['Enemy'],
    GM: [],
  };

  antiReps[npc.allegiance].forEach(
    (antiRep) =>
      (npc.allegianceReputation[antiRep] =
        npc.allegianceReputation[antiRep] || -101)
  );
};

const conditionallyAddInformation = (npc: INPCDefinition) => {
  if (isString(npc.name)) (npc as any).name = [npc.name].filter(Boolean);

  if (!npc.allegiance) npc.allegiance = 'Enemy';

  if (!npc.skillOnKill) npc.skillOnKill = 1;

  if (!npc.repMod) npc.repMod = [];

  if (npc.allegiance !== 'None') {
    npc.repMod.push({ delta: -1, allegiance: npc.allegiance });
  }

  if (!npc.level) npc.level = 1;

  if (!npc.hp) npc.hp = { min: -1, max: -1 };

  if (!npc.gold) npc.gold = { min: -1, max: -1 };

  if (!npc.giveXp) npc.giveXp = { min: -1, max: -1 };

  if (!npc.skillLevels) npc.skillLevels = 0;

  if (!npc.hpMult) npc.hpMult = 1;

  const skillSet: Partial<Record<Skill, number>> = allSkills.reduce(
    (prev, cur) => {
      return {
        ...prev,
        [cur]: 0,
      };
    },
    {}
  );

  allSkills.forEach((skill) => {
    skillSet[skill.toLowerCase() as SkillType] = skillXPFromLevel(
      npc.skillLevels
    );
  });

  if (!skillSet.martial) {
    skillSet.martial = 1;
  }

  npc.skills = skillSet;
  delete (npc as any).skillLevels;

  npc.stats = Object.assign({}, coreStats, otherStats, npc.stats);

  if (npc.otherStats) {
    Object.assign(npc.stats, npc.otherStats);
    delete (npc as any).otherStats;
  }

  if (isNumber(npc.sprite)) npc.sprite = [npc.sprite];

  if (npc.usableSkills)
    npc.usableSkills = npc.usableSkills.map((x) => {
      if (isString(x)) return { result: x, chance: 1 };
      return x;
    });
};

function fillInNPCProperties(npc: INPCDefinition): INPCDefinition {
  conditionallyAddInformation(npc);
  assignReputations(npc);

  return npc;
}

export function formatNPCs(npcs: INPCDefinition[]): INPCDefinition[] {
  return structuredClone(npcs).map((npc: any) => {
    delete npc.hp;
    delete npc.mp;
    delete npc.giveXp;
    delete npc.gold;

    npc.repMod = npc.repMod.filter((rep: any) => rep.delta !== 0);

    if (!npc.drops || npc.drops.length === 0) delete npc.drops;
    if (!npc.copyDrops || npc.copyDrops.length === 0) delete npc.copyDrops;
    if (!npc.dropPool || npc.dropPool.items.length === 0) delete npc.dropPool;

    if (npc.items?.equipment) {
      Object.values(ItemSlot).forEach((slot) => {
        if (npc.items.equipment[slot]?.length > 0) return;
        delete npc.items.equipment[slot];
      });
    }

    ['leash', 'spawn', 'combat'].forEach((triggerType) => {
      if (!npc.triggers?.[triggerType]?.messages) return;
      npc.triggers[triggerType].messages =
        npc.triggers[triggerType].messages.filter(Boolean);
    });

    return fillInNPCProperties(npc as INPCDefinition);
  });
}
