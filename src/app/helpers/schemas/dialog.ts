import { isNumber, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import {
  isArrayOf,
  isObjectWith,
  isPartialEquipmentObject,
  isPartialEquipmentObjectFailure,
  isPartialStatObject,
  isPartialStatObjectFailure,
  isRandomNumber,
} from './_helpers';

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

  ['otherStats', false, isPartialStatObject, isPartialStatObjectFailure],
  ['usableSkills', false, isArrayOf(isString)],
  ['items', false, isObjectWith(['equipment'])],
  [
    'items.equipment',
    false,
    isPartialEquipmentObject,
    isPartialEquipmentObjectFailure,
  ],
  ['dialog', false, isObjectWith(['keyword'])],
  ['behaviors', false, isArrayOf(isObject)],
];
