import { HasIdentification } from './identified';

export enum DynamicEventRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Legendary = 'legendary',
}

export type DynamicEventRarityType = `${DynamicEventRarity}`;

export enum DynamicEventSuccessType {
  Kills = 'kills',
}

export type DynamicEventSuccessTypeType = `${DynamicEventSuccessType}`;

export interface IDynamicEventMetaMetrics {
  count: number;
  type: DynamicEventSuccessTypeType;
  killNPCs: string[];
}

export interface IDynamicEventMeta extends HasIdentification {
  name: string;
  duration: number;
  cooldown: number;
  rarity: DynamicEventRarity;
  conflicts: string[];
  description: string;
  startMessage: string;
  endMessage: string;
  map?: string;
  npc?: string;

  requiresPreviousEvent?: boolean;
  spawnEventOnFailure?: string;
  spawnEventOnSuccess?: string;

  successMetrics: IDynamicEventMetaMetrics;
}
