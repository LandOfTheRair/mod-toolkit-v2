import { isArray, isBoolean, isNumber, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isRollable } from './_helpers';

export const spawnerSchema: Schema = [
  ['npcIds', true, isRollable],
  ['tag', true, isString],

  ['paths', false, isArray],
  ['respawnRate', false, isNumber],
  ['initialSpawn', false, isNumber],
  ['maxCreatures', false, isNumber],
  ['spawnRadius', false, isNumber],
  ['randomWalkRadius', false, isNumber],
  ['leashRadius', false, isNumber],

  ['shouldSerialize', false, isBoolean],
  ['alwaysSpawn', false, isBoolean],
  ['requireHoliday', false, isString],
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
  ['npcAISettings', false, isArray],

  ['respectKnowledge', false, isBoolean],
  ['isDangerous', false, isBoolean],
];
