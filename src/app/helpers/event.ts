import {
  DynamicEventRarity,
  DynamicEventSuccessTypeType,
  IDynamicEventMeta,
} from '../../interfaces';
import { id } from './id';

export const defaultEvent: () => IDynamicEventMeta = () => ({
  _id: id(),
  cooldown: 0,
  description: '',
  duration: 0,
  endMessage: '',
  name: '',
  rarity: DynamicEventRarity.Common,
  startMessage: '',
  conflicts: [],
  map: undefined as unknown as string,
  npc: undefined as unknown as string,

  requiresPreviousEvent: false,
  spawnEventOnFailure: undefined as unknown as string,
  spawnEventOnSuccess: undefined as unknown as string,

  successMetrics: {
    count: 0,
    killNPCs: [],
    type: undefined as unknown as DynamicEventSuccessTypeType,
  },
});
