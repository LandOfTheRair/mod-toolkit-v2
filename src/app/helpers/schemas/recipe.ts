import { isArray, isBoolean, isNumber, isString } from 'lodash';
import { Schema } from '../../../interfaces';

export const recipeSchema: Schema = [
  ['category', true, isString],
  ['item', true, isString],
  ['name', true, isString],
  ['recipeType', true, isString],

  ['maxSkillForGains', false, isNumber],
  ['requireSkill', false, isNumber],
  ['skillGained', false, isNumber],
  ['xpGained', false, isNumber],
  ['copySkillToPotency', false, isBoolean],
  ['ingredients', false, isArray],
  ['ozIngredients', false, isArray],
  ['potencyScalar', false, isNumber],
  ['requireClass', false, isArray],
  ['requireLearn', false, isBoolean],
  ['requireSpell', false, isString],
  ['transferOwnerFrom', false, isString],
];
