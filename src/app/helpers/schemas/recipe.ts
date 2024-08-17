import { isBoolean, isNumber, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isArrayOf, isArrayOfAtMostLength, isOzIngredient } from './_helpers';

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
  ['ingredients', false, isArrayOf(isString)],
  [
    'ingredients',
    false,
    isArrayOfAtMostLength(8),
    () => 'ingredients must not have more than 8 elements',
  ],
  ['ozIngredients', false, isArrayOf(isOzIngredient)],
  [
    'ozIngredients',
    false,
    isArrayOfAtMostLength(2),
    () => 'ozIngredients must not have more than 2 elements',
  ],
  ['potencyScalar', false, isNumber],
  ['requireClass', false, isArrayOf(isString)],
  ['requireLearn', false, isBoolean],
  ['requireSpell', false, isString],
  ['transferOwnerFrom', false, isString],
];
