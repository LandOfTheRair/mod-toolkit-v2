import { isArray, isBoolean, isString } from 'lodash';
import { Schema } from '../../../interfaces';

export const droptableSchema: Schema = [
  ['mapName', false, isString],
  ['regionName', false, isString],
  ['isGlobal', false, isBoolean],
  ['drops', true, isArray],
];
