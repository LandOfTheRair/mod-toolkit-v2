import { isBoolean, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isArrayOf, isRollable } from './_helpers';

export const droptableSchema: Schema = [
  ['mapName', false, isString],
  ['regionName', false, isString],
  ['isGlobal', false, isBoolean],
  ['drops', true, isArrayOf(isRollable)],
];
