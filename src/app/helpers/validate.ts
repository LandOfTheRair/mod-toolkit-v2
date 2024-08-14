import { get } from 'lodash';
import { IModKit, ItemSlotType } from '../../interfaces';

interface ValidationMessage {
  header?: string;
  subheader?: string;
  type?: 'warning' | 'good' | 'error';
  message?: string;
}

function removeExtraneousSubheaders(validations: ValidationMessage[]) {
  const indicesToRemove: number[] = [];
  validations.forEach((validation, idx) => {
    if (!validation.subheader) return;
    if (validations[idx + 1].message) return;

    indicesToRemove.push(idx);
  });

  validations = validations
    .filter((t, idx) => !indicesToRemove.includes(idx))
    .filter(Boolean);

  return validations;
}

export const validationMessagesForMod = (mod: IModKit) => {
  const validations: ValidationMessage[] = [];

  // item validators
  const checkItemStats = () => {
    const itemValidations: ValidationMessage[] = [];

    itemValidations.push({ subheader: 'Awkward Item Stats & Settings' });

    mod.items.forEach((item) => {
      const modsActionSpeed =
        get(item, 'randomStats.actionSpeed') || get(item, 'stats.actionSpeed');
      if (modsActionSpeed) {
        itemValidations.push({
          type: 'warning',
          message: `${item.name} modifies actionSpeed.`,
        });
      }

      const destroysOnDrop = get(item, 'destroyOnDrop');
      if (destroysOnDrop) {
        itemValidations.push({
          type: 'warning',
          message: `${item.name} destroys on drop.`,
        });
      }
    });

    if (itemValidations.length === 1) {
      itemValidations.push({ type: 'good', message: 'No abnormalities!' });
    }

    validations.push(...itemValidations);
  };

  const checkItemUses = () => {
    const itemValidations: ValidationMessage[] = [];

    itemValidations.push({ subheader: 'Unused Items' });

    // item count tracker
    const itemCounts: Record<string, number> = {};

    const addItemCount = (itemName: string) => {
      if (itemCounts[itemName] >= 0) {
        itemCounts[itemName]++;
      }
    };

    mod.items.forEach((item) => {
      itemCounts[item.name] = 0;
    });

    // count item usages by type
    mod.drops.forEach((droptable) => {
      addItemCount(droptable.result);
    });

    mod.recipes.forEach((recipe) => {
      addItemCount(recipe.item);

      (recipe.ingredients || []).forEach((ing) => {
        addItemCount(ing);
      });
    });

    mod.npcs.forEach((npc) => {
      npc.items.sack.forEach((item) => {
        addItemCount(item.result);
      });

      Object.keys(npc.items.equipment || {}).forEach((slot) => {
        (npc.items.equipment[slot as ItemSlotType] || []).forEach((item) => {
          addItemCount(item.result);
        });
      });

      if (npc.tansFor) {
        addItemCount(npc.tansFor);
      }

      npc.drops.forEach((item) => {
        addItemCount(item.result);
      });

      npc.dropPool.items.forEach((item) => {
        addItemCount(item.result);
      });
    });

    Object.keys(itemCounts).forEach((item) => {
      if (itemCounts[item] > 0) return;

      itemValidations.push({ type: 'warning', message: `${item} is unused.` });
    });

    if (itemValidations.length === 1) {
      itemValidations.push({ type: 'good', message: 'No abnormalities!' });
    }

    validations.push(...itemValidations);
  };

  const checkItems = () => {
    validations.push({ header: 'Items' });
    checkItemStats();
    checkItemUses();
  };

  const checkMapProperties = () => {
    const allMapPropValidations: ValidationMessage[] = [];

    mod.maps.forEach((map) => {
      const mapValidations: ValidationMessage[] = [];
      mapValidations.push({ subheader: `${map.name} Map Properties` });
      [
        'itemExpirationHours',
        'itemGarbageCollection',
        'maxCreatures',
        'maxLevel',
        'maxSkill',
        'region',
        'respawnX',
        'respawnY',
      ].forEach((prop) => {
        if (map.map.properties[prop]) return;

        mapValidations.push({
          type: 'error',
          message: `${map.name} map does not have a ${prop} property.`,
        });
      });

      allMapPropValidations.push(...mapValidations);
    });

    validations.push(...allMapPropValidations);
  };

  const checkMapSpawners = () => {
    const bosses: string[] = [];
    const modSpawnerTags: Record<string, number> = {};
    const usedSpawnerTags: Record<string, number> = {};

    const addModSpawnerCount = (item: string) => {
      if (modSpawnerTags[item] >= 0) {
        modSpawnerTags[item]++;
      }
    };

    const addUsedSpawnerCount = (item: string) => {
      usedSpawnerTags[item] = usedSpawnerTags[item] || 0;
      usedSpawnerTags[item]++;
    };

    mod.spawners.forEach((item) => {
      modSpawnerTags[item.tag] = 0;
    });

    mod.maps.forEach((map) => {
      map.map.layers[10].objects.forEach((spawner: any) => {
        addModSpawnerCount(spawner.properties.tag as string);
        addUsedSpawnerCount(spawner.properties.tag as string);

        if (spawner.properties.lairName) {
          bosses.push(spawner.properties.lairName as string);
        }
      });
    });

    // calculate unused mod spawners
    const modSpawnerValidations: ValidationMessage[] = [];

    modSpawnerValidations.push({ subheader: 'Unused Mod Spawners' });

    Object.keys(modSpawnerTags).forEach((item) => {
      if (modSpawnerTags[item] > 0) return;

      modSpawnerValidations.push({
        type: 'warning',
        message: `${item} is unused.`,
      });
    });

    if (modSpawnerValidations.length === 1) {
      modSpawnerValidations.push({
        type: 'good',
        message: 'No abnormalities!',
      });
    }

    validations.push(...modSpawnerValidations);

    // calculate map spawners
    const mapSpawnerValidations: ValidationMessage[] = [];

    mapSpawnerValidations.push({ subheader: 'Map Spawners' });

    Object.keys(usedSpawnerTags).forEach((item) => {
      if (item === 'Global Lair') return;
      if (usedSpawnerTags[item] > 0 && modSpawnerTags[item] > 0) return;

      mapSpawnerValidations.push({
        type: 'error',
        message: `${item} is not a valid spawner tag.`,
      });
    });

    if (mapSpawnerValidations.length === 1) {
      mapSpawnerValidations.push({
        type: 'good',
        message: 'No abnormalities!',
      });
    }

    validations.push(...mapSpawnerValidations);

    // calculate boss validations
    const mapLairValidations: ValidationMessage[] = [];

    mapLairValidations.push({ subheader: 'Lairs' });

    bosses.forEach((boss) => {
      if (mod.npcs.some((npc) => npc.npcId === boss)) return;

      mapLairValidations.push({
        type: 'error',
        message: `${boss} is not a valid lair.`,
      });
    });

    if (mapLairValidations.length === 1) {
      mapLairValidations.push({ type: 'good', message: 'No abnormalities!' });
    }

    validations.push(...mapLairValidations);
  };

  const checkMapNPCDialogs = () => {
    // check npc dialog refs, make sure they exist
    const mapDialogValidations: ValidationMessage[] = [];

    const foundDialogs: Record<string, number> = {};

    const addDialogCount = (item: string) => {
      foundDialogs[item] ??= 0;
      foundDialogs[item]++;
    };

    mapDialogValidations.push({ subheader: 'NPC Scripts' });

    mod.maps.forEach((map) => {
      map.map.layers[9].objects.forEach((npc: any) => {
        addDialogCount(npc.properties.tag as string);
      });
    });

    mod.dialogs.forEach((dia) => {
      if (foundDialogs[dia.tag]) return;

      mapDialogValidations.push({
        type: 'warning',
        message: `${dia.tag} is unused.`,
      });
    });

    if (mapDialogValidations.length === 1) {
      mapDialogValidations.push({ type: 'good', message: 'No abnormalities!' });
    }

    validations.push(...mapDialogValidations);
  };

  // map validators
  const checkMaps = () => {
    validations.push({ header: 'Maps' });

    checkMapProperties();
    checkMapSpawners();
    checkMapNPCDialogs();
  };

  checkItems();
  checkMaps();

  return removeExtraneousSubheaders(validations);
};

export const numErrorsForMod = (mod: IModKit) => {
  const validationMessages = validationMessagesForMod(mod);

  const numErrors = validationMessages.filter(
    (vdn) => vdn.type === 'error'
  ).length;

  return numErrors;
};
