import { IModKit } from '../../interfaces';
import { formatItems, formatNPCs, formatSpawners } from './export';

export function formatMod(modData: IModKit, shouldBackup: boolean): IModKit {
  const backup = structuredClone(modData);

  const exported: IModKit = {
    meta: {
      ...structuredClone(modData.meta),
      _backup: shouldBackup ? backup : undefined,
    },

    npcs: formatNPCs(modData.npcs),
    items: formatItems(modData.items),
    drops: modData.drops,
    dialogs: modData.dialogs,
    maps: modData.maps,
    quests: modData.quests,
    recipes: modData.recipes,
    spawners: formatSpawners(modData.spawners),
    cores: modData.cores,
    stems: modData.stems,
    traitTrees: modData.traitTrees,
    achievements: modData.achievements,
    events: modData.events,
  };

  return exported;
}
