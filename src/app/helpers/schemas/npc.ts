import { isBoolean, isInteger, isNumber, isString } from 'lodash';
import { ItemSlot, Schema, SchemaProperty } from '../../../interfaces';
import {
  isArrayOf,
  isDropPool,
  isNPCEffect,
  isObjectWith,
  isObjectWithFailure,
  isObjectWithSome,
  isObjectWithSomeFailure,
  isPartialEquipmentObject,
  isPartialEquipmentObjectFailure,
  isPartialReputationObject,
  isPartialReputationObjectFailure,
  isPartialSkillObject,
  isPartialSkillObjectFailure,
  isPartialStatObject,
  isPartialStatObjectFailure,
  isRandomNumber,
  isRepMod,
  isRollable,
  isTraitObject,
} from './_helpers';

const equipmentValidators: SchemaProperty[] = Object.values(ItemSlot).map(
  (slot) => [`items.equipment.${slot}`, false, isArrayOf(isRollable)]
);

const triggerValidators: SchemaProperty[] = ['leash', 'spawn', 'combat']
  .map((triggerType) => [
    [
      `triggers.${triggerType}`,
      false,
      isObjectWithSome(['messages', 'sfx']),
      isObjectWithSomeFailure(['messages', 'sfx']),
    ],
    [`triggers.${triggerType}.messages`, false, isArrayOf(isString)],
    [
      `triggers.${triggerType}.sfx`,
      false,
      isObjectWith(['name', 'maxChance']),
      isObjectWithFailure(['name', 'maxChance']),
    ],
    [`triggers.${triggerType}.sfx.name`, false, isString],
    [`triggers.${triggerType}.sfx.maxChance`, false, isNumber],
  ])
  .flat() as SchemaProperty[];

export const npcSchema: Schema = [
  ['npcId', true, isString],
  ['sprite', true, isArrayOf(isInteger)],
  ['cr', true, isInteger],
  ['hp', true, isRandomNumber],
  ['mp', false, isRandomNumber],
  ['giveXp', true, isRandomNumber],
  ['gold', true, isRandomNumber],
  ['skillOnKill', true, isInteger],

  ['name', false, isArrayOf(isString)],
  ['alignment', false, isString],
  ['affiliation', false, isString],
  ['allegiance', false, isString],
  [
    'allegianceReputation',
    false,
    isPartialReputationObject,
    isPartialReputationObjectFailure,
  ],
  ['aquaticOnly', false, isBoolean],
  ['avoidWater', false, isBoolean],
  ['baseClass', false, isString],
  ['baseEffects', false, isArrayOf(isNPCEffect)],
  ['copyDrops', false, isArrayOf(isRollable)],
  ['dropPool', false, isDropPool],
  ['drops', false, isArrayOf(isRollable)],
  ['forceAI', false, isString],
  ['items', false, isObjectWith(['equipment', 'sack', 'belt'])],
  [
    'items.equipment',
    false,
    isPartialEquipmentObject,
    isPartialEquipmentObjectFailure,
  ],
  ...equipmentValidators,

  ['items.sack', false, isArrayOf(isRollable)],
  ['items.belt', false, isArrayOf(isRollable)],

  ['level', true, isInteger],
  ['hpMult', false, isInteger],

  ['monsterClass', false, isString],
  ['monsterGroup', false, isString],
  ['hostility', false, isString],
  ['noCorpseDrop', false, isBoolean],
  ['noItemDrop', false, isBoolean],
  ['repMod', false, isArrayOf(isRepMod)],

  ['stats', true, isPartialStatObject, isPartialStatObjectFailure],
  ['skills', true, isPartialSkillObject, isPartialSkillObjectFailure],

  [
    'summonStatModifiers',
    false,
    isPartialStatObject,
    isPartialStatObjectFailure,
  ],
  [
    'summonSkillModifiers',
    false,
    isPartialSkillObject,
    isPartialSkillObjectFailure,
  ],

  ['tanSkillRequired', false, isInteger],
  ['tansFor', false, isString],
  ['traitLevels', false, isTraitObject],
  [
    'triggers',
    false,
    isObjectWithSome(['leash', 'spawn', 'combat']),
    isObjectWithSomeFailure(['leash', 'spawn', 'combat']),
  ],

  ...triggerValidators,

  ['usableSkills', false, isArrayOf(isRollable)],
];
