import { isNumber, isString } from 'lodash';
import {
  AllegianceType,
  INPCDefinition,
  Skill,
  SkillType,
} from '../../src/interfaces';

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

const skillXPFromLevel = (level: number) => {
  if (level === 0) return 100;
  if (level === 1) return 200;

  return Math.floor(Math.pow(1.55, level) * 100);
};

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

export function fillInNPCProperties(npc: INPCDefinition) {
  conditionallyAddInformation(npc);
  assignReputations(npc);

  return npc;
}
