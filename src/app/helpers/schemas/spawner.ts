import { isBoolean, isNumber, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isArrayOf, isRollable } from './_helpers';

export const spawnerSchema: Schema = [
  ['npcIds', true, isArrayOf(isRollable)],
  ['tag', true, isString],

  ['paths', false, isArrayOf(isString)],
  ['respawnRate', false, isNumber],
  ['initialSpawn', false, isNumber],
  ['maxCreatures', false, isNumber],
  ['spawnRadius', false, isNumber],
  ['randomWalkRadius', false, isNumber],
  ['leashRadius', false, isNumber],

  ['shouldSerialize', false, isBoolean],
  ['alwaysSpawn', false, isBoolean],
  ['requireHoliday', false, isString],
  ['requireEvent', false, isString],
  ['requireDeadToRespawn', false, isBoolean],
  ['canSlowDown', false, isBoolean],

  ['stripX', false, isNumber],
  ['stripY', false, isNumber],
  ['stripRadius', false, isNumber],
  ['shouldEatTier', false, isNumber],
  ['shouldStrip', false, isBoolean],
  ['stripOnSpawner', false, isBoolean],

  ['doInitialSpawnImmediately', false, isBoolean],
  ['attributeAddChance', false, isNumber],
  ['eliteTickCap', false, isNumber],
  ['npcAISettings', false, isArrayOf(isString)],

  ['maxSpawn', false, isNumber],
  ['shouldBeActive', false, isBoolean],

  ['respectKnowledge', false, isBoolean],
  ['isDangerous', false, isBoolean],
];
