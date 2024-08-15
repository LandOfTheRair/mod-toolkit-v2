import { IModKit } from '../../interfaces';
import { formatItems, formatNPCs, formatSpawners } from './export';

function stripIds(modData: IModKit) {
  Object.keys(modData).forEach((modKey) => {
    const key = modKey as keyof IModKit;

    if (key === 'meta') return;

    modData[key].forEach((ident: any) => delete ident._id);
  });
}

export function formatMod(modData: IModKit): IModKit {
  const backup = structuredClone(modData);

  stripIds(modData);

  const exported: IModKit = {
    meta: {
      ...structuredClone(modData.meta),
      _backup: backup,
    },

    npcs: formatNPCs(modData.npcs),
    items: formatItems(modData.items),
    drops: modData.drops,
    dialogs: modData.dialogs,
    maps: modData.maps,
    quests: modData.quests,
    recipes: modData.recipes,
    spawners: formatSpawners(modData.spawners),
  };

  return exported;
}
