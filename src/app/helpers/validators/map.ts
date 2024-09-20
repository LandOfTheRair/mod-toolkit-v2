import { IModKit, ModJSON, ValidationMessageGroup } from '../../../interfaces';

export function checkMapProperties(mod: IModKit): ValidationMessageGroup[] {
  const groups: ValidationMessageGroup[] = [];

  mod.maps.forEach((map) => {
    const mapValidations: ValidationMessageGroup = {
      header: `Map Properties (${map.name})`,
      messages: [],
    };

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

      mapValidations.messages.push({
        type: 'error',
        message: `${map.name} map does not have a ${prop} property.`,
      });
    });

    if (map.map.version > 1.1) {
      mapValidations.messages.push({
        type: 'error',
        message: `${map.name} is version >1.1. It must be 1.1 - the json2 format is not supported by the game.`,
      });
    }

    if (map.map.layers.length < 16) {
      mapValidations.messages.push({
        type: 'warning',
        message: `${map.name} has fewer than the normal 16 layers. Some things may not work correctly.`,
      });
    }

    groups.push(mapValidations);
  });

  return groups;
}

export function checkMapBGMs(
  mod: IModKit,
  json: ModJSON
): ValidationMessageGroup[] {
  const groups: ValidationMessageGroup[] = [];

  const allBGMs: string[] = json.bgm ?? [];

  mod.maps.forEach((map) => {
    const mapValidations: ValidationMessageGroup = {
      header: `Map BGMs (${map.name})`,
      messages: [],
    };

    map.map.layers?.[12].objects.forEach((bgm: { name: string }) => {
      if (!allBGMs.includes(bgm.name)) {
        mapValidations.messages.push({
          type: 'error',
          message: `${map.name} map has a BGM named ${bgm.name}.`,
        });
      }

      if (bgm.name.includes('nostalgia')) {
        mapValidations.messages.push({
          type: 'error',
          message: `${map.name} map forcibly sets BGM ${bgm.name} - it should not set nostalgia directly.`,
        });
      }
    });

    groups.push(mapValidations);
  });

  return groups;
}

export function checkMapItems(mod: IModKit): ValidationMessageGroup[] {
  const validItemNames = mod.items.map((i) => i.name);
  const groups: ValidationMessageGroup[] = [];

  mod.maps.forEach((map) => {
    const mapValidations: ValidationMessageGroup = {
      header: `Map Items (${map.name})`,
      messages: [],
    };

    map.map.layers?.[8].objects.forEach((obj: any) => {
      if (!obj.properties?.requireHeld) return;

      if (!validItemNames.includes(obj.properties.requireHeld as string)) {
        mapValidations.messages.push({
          type: 'error',
          message: `${obj.properties.requireHeld} is not a valid item (Held|${
            obj.x / 64
          },${obj.y / 64 - 1}).`,
        });
      }
    });

    map.map.layers?.[9].objects.forEach((obj: any) => {
      if (!obj.properties?.peddleItem) return;

      if (!validItemNames.includes(obj.properties.peddleItem as string)) {
        mapValidations.messages.push({
          type: 'error',
          message: `${obj.properties.peddleItem} is not a valid item (Peddler|${
            obj.x / 64
          },${obj.y / 64 - 1}).`,
        });
      }
    });

    groups.push(mapValidations);
  });

  return groups;
}

export function checkMapSpawners(mod: IModKit): ValidationMessageGroup[] {
  const groups: ValidationMessageGroup[] = [];

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
      if (!spawner.properties) return;

      addModSpawnerCount(spawner.properties.tag as string);
      addUsedSpawnerCount(spawner.properties.tag as string);

      if (spawner.properties.lairName) {
        bosses.push(spawner.properties.lairName as string);
      }
    });
  });

  // calculate unused spawners
  const modSpawnerValidations: ValidationMessageGroup = {
    header: `Unused Spawners`,
    messages: [],
  };

  Object.keys(modSpawnerTags).forEach((item) => {
    if (modSpawnerTags[item] > 0) return;

    modSpawnerValidations.messages.push({
      type: 'warning',
      message: `${item} is unused.`,
    });
  });

  groups.push(modSpawnerValidations);

  // calculate map spawners
  const mapSpawnerValidations: ValidationMessageGroup = {
    header: `Map Spawners`,
    messages: [],
  };

  Object.keys(usedSpawnerTags).forEach((item) => {
    if (item === 'Global Lair') return;
    if (usedSpawnerTags[item] > 0 && modSpawnerTags[item] > 0) return;

    mapSpawnerValidations.messages.push({
      type: 'error',
      message: `${item} is not a valid spawner tag.`,
    });
  });

  groups.push(mapSpawnerValidations);

  // calculate boss validations
  const mapLairValidations: ValidationMessageGroup = {
    header: `Lairs`,
    messages: [],
  };

  bosses.forEach((boss) => {
    if (mod.npcs.some((npc) => npc.npcId === boss)) return;

    mapLairValidations.messages.push({
      type: 'error',
      message: `${boss} is not a valid lair.`,
    });
  });

  groups.push(mapLairValidations);

  return groups;
}
