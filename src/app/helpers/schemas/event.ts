import { isBoolean, isNumber, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isArrayOf } from './_helpers';

export const eventSchema: Schema = [
  ['name', true, isString],
  ['duration', true, isNumber],
  ['cooldown', true, isNumber],
  ['rarity', true, isString],
  ['conflicts', false, isArrayOf(isString)],
  ['description', true, isString],
  ['startMessage', false, isString],
  ['endMessage', false, isString],
  ['map', false, isString],
  ['npc', false, isString],
  ['requiresPreviousEvent', false, isBoolean],
  ['spawnEventOnFailure', false, isString],
  ['spawnEventOnSuccess', false, isString],
  ['successMetrics', true, isObject],
];
