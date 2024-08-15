import { isArray, isBoolean, isInteger, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import {
  isDropPool,
  isOptionalRollable,
  isRandomNumber,
  isRollable,
} from './_helpers';

export const npcSchema: Schema = [
  ['npcId', true, isString],
  ['sprite', true, isArray],
  ['cr', true, isInteger],
  ['hp', true, isRandomNumber],
  ['mp', false, isRandomNumber],
  ['giveXp', true, isRandomNumber],
  ['gold', true, isRandomNumber],
  ['skillOnKill', true, isInteger],

  ['name', false, isArray],
  ['alignment', false, isString],
  ['affiliation', false, isString],
  ['allegiance', false, isString],
  ['allegianceReputation', false, isObject],
  ['aquaticOnly', false, isBoolean],
  ['avoidWater', false, isBoolean],
  ['baseClass', false, isString],
  ['baseEffects', false, isArray],
  ['copyDrops', false, isRollable],
  ['dropPool', false, isDropPool],
  ['drops', false, isRollable],
  ['forceAI', false, isString],
  ['items', false, isObject],
  ['items.equipment', false, isObject],
  ['items.sack', false, isOptionalRollable],

  ['level', true, isInteger],
  ['hpMult', false, isInteger],

  ['monsterClass', false, isString],
  ['monsterGroup', false, isString],
  ['hostility', false, isString],
  ['noCorpseDrop', false, isBoolean],
  ['noItemDrop', false, isBoolean],
  ['repMod', false, isArray],

  ['stats', true, isObject],
  ['skills', true, isObject],

  ['summonStatModifiers', false, isObject],
  ['summonSkillModifiers', false, isObject],

  ['tanSkillRequired', false, isInteger],
  ['tansFor', false, isString],
  ['traitLevels', false, isObject],
  ['triggers', false, isObject],

  ['usableSkills', false, isArray],
];
