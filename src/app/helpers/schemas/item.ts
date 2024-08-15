import { isArray, isBoolean, isInteger, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import {
  isCosmetic,
  isEffect,
  isEncrust,
  isIntegerBetween,
  isRequirement,
  isRollable,
  isSuccor,
  isTrait,
} from './_helpers';

export const itemSchema: Schema = [
  ['name', true, isString],
  ['sprite', true, isInteger],
  ['animation', false, isInteger],
  ['value', true, isInteger],
  ['desc', true, isString],
  ['itemClass', true, isString],
  ['type', true, isString],

  ['binds', false, isBoolean],
  ['tellsBind', false, isBoolean],
  ['extendedDesc', false, isString],
  ['isBeltable', false, isBoolean],
  ['isSackable', false, isBoolean],
  ['isHeavy', false, isBoolean],
  ['secondaryType', false, isString],
  ['stats', false, isObject],
  ['maxUpgrades', false, isInteger],
  ['canUpgradeWith', false, isBoolean],
  ['recipe', false, isString],

  ['cosmetic', false, isCosmetic],
  ['cosmetic.isPermanent', false, isBoolean],
  ['cosmetic.name', false, isString],

  ['requirements', false, isRequirement],
  ['requirements.alignment', false, isString],
  ['requirements.baseClass', false, isString],
  ['requirements.quest', false, isString],
  ['requirements.level', false, isInteger],

  ['equipEffect', false, isEffect],
  ['equipEffect.name', false, isString],
  ['equipEffect.potency', false, isInteger],
  ['equipEffect.duration', false, isInteger],
  ['equipEffect.range', false, isIntegerBetween(0, 5)],

  ['strikeEffect', false, isEffect],
  ['strikeEffect.name', false, isString],
  ['strikeEffect.potency', false, isInteger],
  ['strikeEffect.chance', false, isIntegerBetween(0, 100)],
  ['strikeEffect.duration', false, isInteger],
  ['strikeEffect.range', false, isIntegerBetween(0, 5)],

  ['useEffect', false, isEffect],
  ['useEffect.name', false, isString],
  ['useEffect.potency', false, isInteger],
  ['useEffect.canApply', false, isBoolean],
  ['useEffect.duration', false, isInteger],
  ['useEffect.uses', false, isInteger],
  ['useEffect.range', false, isIntegerBetween(0, 5)],

  ['trapEffect', false, isEffect],
  ['trapEffect.name', false, isString],
  ['trapEffect.potency', false, isInteger],
  ['trapEffect.duration', false, isInteger],
  ['trapEffect.uses', false, isInteger],
  ['trapEffect.range', false, isIntegerBetween(0, 5)],

  ['breakEffect', false, isEffect],
  ['breakEffect.name', false, isString],
  ['breakEffect.potency', false, isInteger],

  ['effect.extra', false, isObject],

  ['encrustGive', false, isEncrust],

  ['tier', false, isInteger],
  ['destroyOnDrop', false, isBoolean],
  ['twoHanded', false, isBoolean],
  ['canShoot', false, isBoolean],
  ['attackRange', false, isIntegerBetween(0, 5)],
  ['offhand', false, isBoolean],
  ['proneChance', false, isIntegerBetween(0, 100)],
  ['returnsOnThrow', false, isBoolean],

  ['shots', false, isInteger],
  ['damageClass', false, isString],

  ['trapUses', false, isInteger],

  ['containedItems', false, isRollable],

  ['succorInfo', false, isSuccor],
  ['succorInfo.map', false, isString],
  ['succorInfo.x', false, isInteger],
  ['succorInfo.y', false, isInteger],

  ['trait', false, isTrait],
  ['trait.name', false, isString],
  ['trait.level', false, isInteger],

  ['bookFindablePages', false, isInteger],
  ['bookItemFilter', false, isString],
  ['bookPage', false, isInteger],
  ['bookCurrentPage', false, isInteger],
  ['bookPages', false, isArray],

  ['ounces', false, isInteger],
  ['notUsableAfterHours', false, isInteger],

  ['quality', false, isInteger],
  ['sellValue', false, isInteger],

  ['randomStats', false, isObject],
  ['randomTrait', false, isObject],
];
