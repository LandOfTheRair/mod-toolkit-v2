import { IModKit, ValidationMessageGroup } from '../../../interfaces';

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

  if (modSpawnerValidations.messages.length === 0) {
    modSpawnerValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

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

  if (mapSpawnerValidations.messages.length === 0) {
    mapSpawnerValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

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

  if (mapLairValidations.messages.length === 0) {
    mapLairValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  groups.push(mapLairValidations);

  return groups;
}
