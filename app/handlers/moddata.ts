import { groupBy } from 'lodash';
import {
  IDroptable,
  IDroptableMap,
  IDroptableRegion,
  IExportedModKit,
  IItemDefinition,
  IModKit,
  INPCDefinition,
  ISpawnerData,
} from '../../src/interfaces';
import { fillInItemProperties } from './format-item';
import { fillInNPCProperties } from './format-npc';

function formatSpawners(spawners: ISpawnerData[]): ISpawnerData[] {
  return spawners.map((spawner) => {
    delete spawner._paths;
    return spawner;
  });
}

function formatNPCs(npcs: INPCDefinition[]): INPCDefinition[] {
  return npcs.map((npc: any) => {
    delete npc.hp;
    delete npc.mp;
    delete npc.giveXp;
    delete npc.gold;

    npc.repMod = npc.repMod.filter((rep: any) => rep.delta !== 0);

    if (npc.drops.length === 0) delete npc.drops;
    if (npc.copyDrops.length === 0) delete npc.copyDrops;
    if (npc.dropPool.items.length === 0) delete npc.dropPool;

    Object.keys(npc.items.equipment).forEach((slot) => {
      if (npc.items.equipment[slot].length > 0) return;
      delete npc.items.equipment[slot];
    });

    npc.triggers.leash.messages = npc.triggers.leash.messages.filter(Boolean);
    npc.triggers.spawn.messages = npc.triggers.spawn.messages.filter(Boolean);
    npc.triggers.leash.messages = npc.triggers.leash.messages.filter(Boolean);

    return fillInNPCProperties(npc);
  });
}

function formatDroptables(droptables: IDroptable[]): {
  regions: IDroptableRegion[];
  maps: IDroptableMap[];
} {
  const globalDrops = droptables.filter((f) => f.isGlobal);
  const regionDrops = groupBy(
    droptables.filter((f) => f.regionName),
    'regionName'
  );
  const mapDrops = groupBy(
    droptables.filter((f) => f.mapName),
    'mapName'
  );

  return {
    maps: Object.keys(mapDrops).map((mapName) => ({
      mapName,
      drops: [...mapDrops[mapName], ...globalDrops],
    })),
    regions: Object.keys(regionDrops).map((regionName) => ({
      regionName,
      drops: [...regionDrops[regionName], ...globalDrops],
    })),
  };
}

function formatItems(items: IItemDefinition[]): IItemDefinition[] {
  return items.map((item: any) => {
    if (!item.sellValue) delete item.sellValue;
    if (!item.maxUpgrades) delete item.maxUpgrades;
    if (!item.secondaryType) delete item.secondaryType;
    if (!item.quality) delete item.quality;
    if (item.succorInfo && !item.succorInfo.map) delete item.succorInfo;
    if (item.cosmetic && !item.cosmetic.name) delete item.cosmetic;
    if (item.containedItems && !item.containedItems.length)
      delete item.containedItems;
    if (!item.trait.name) delete item.trait;
    if (item.randomTrait.name.length === 0) delete item.randomTrait;
    if (item.useEffect && !item.useEffect.name) delete item.useEffect;
    if (item.strikeEffect && !item.strikeEffect.name) delete item.strikeEffect;
    if (item.breakEffect && !item.breakEffect.name) delete item.breakEffect;
    if (item.equipEffect && !item.equipEffect.name) delete item.equipEffect;

    if (item.requirements) {
      if (!item.requirements.baseClass) delete item.requirements.baseClass;
      if (!item.requirements.level) delete item.requirements.level;
      if (!item.requirements.baseClass && !item.requirements.level)
        delete item.requirements;
    }

    return fillInItemProperties(item);
  });
}

function stripIds(modData: IModKit) {
  Object.keys(modData).forEach((modKey) => {
    const key = modKey as keyof IModKit;

    if (key === 'meta') return;

    modData[key].forEach((ident: any) => delete ident._id);
  });
}

export function formatMod(modData: IModKit): IExportedModKit {
  stripIds(modData);

  const exported: IExportedModKit = {
    meta: {
      ...structuredClone(modData.meta),
      _backup: structuredClone(modData),
    },

    npcs: formatNPCs(modData.npcs),
    items: formatItems(modData.items),
    drops: formatDroptables(modData.drops),
    dialogs: modData.dialogs,
    maps: modData.maps,
    quests: modData.quests,
    recipes: modData.recipes,
    spawners: formatSpawners(modData.spawners),
  };

  return exported;
}
