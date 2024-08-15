import { isArray, isNumber, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isRandomNumber } from './_helpers';

export const dialogSchema: Schema = [
  ['tag', true, isString],

  ['name', false, isString],
  ['affiliation', false, isString],
  ['allegiance', false, isString],
  ['alignment', false, isString],
  ['hostility', false, isString],
  ['level', false, isNumber],
  ['hp', false, isRandomNumber],
  ['mp', false, isRandomNumber],

  ['otherStats', false, isObject],
  ['usableSkills', false, isArray],
  ['items', false, isObject],
  ['items.equipment', false, isObject],
  ['dialog', false, isObject],
  ['behaviors', false, isArray],
];
