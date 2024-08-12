import { Rollable } from './building-blocks';
import { HasIdentification } from './identified';

export interface ISpawnerData extends HasIdentification {
  npcIds: Rollable[];
  paths: string[];
  tag: string;
  respawnRate: number;
  initialSpawn: number;
  maxCreatures: number;
  spawnRadius: number;
  randomWalkRadius: number;
  leashRadius: number;
  shouldSerialize: boolean;
  alwaysSpawn: boolean;
  requireHoliday?: string;
  requireDeadToRespawn: boolean;
  canSlowDown: boolean;
  stripX: number;
  stripY: number;
  stripRadius: number;
  shouldEatTier: number;
  shouldStrip: boolean;
  stripOnSpawner: boolean;
  doInitialSpawnImmediately: boolean;
  attributeAddChance: number;
  eliteTickCap: number;
  npcAISettings: string[];
  respectKnowledge?: boolean;
  isDangerous?: boolean;
  _paths?: string;
}
