import { IModKit, ValidationMessageGroup } from '../../../interfaces';

export function checkMapNPCDialogs(mod: IModKit): ValidationMessageGroup {
  // check npc dialog refs, make sure they exist
  const mapDialogValidations: ValidationMessageGroup = {
    header: `Unused NPC Scripts`,
    messages: [],
  };

  const foundDialogs: Record<string, number> = {};

  const addDialogCount = (item: string) => {
    foundDialogs[item] ??= 0;
    foundDialogs[item]++;
  };

  mod.maps.forEach((map) => {
    map.map.layers[9].objects.forEach((npc: any) => {
      addDialogCount(npc.properties.tag as string);
    });
  });

  mod.dialogs.forEach((dia) => {
    if (foundDialogs[dia.tag]) return;

    mapDialogValidations.messages.push({
      type: 'warning',
      message: `${dia.tag} is unused.`,
    });
  });

  if (mapDialogValidations.messages.length === 0) {
    mapDialogValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return mapDialogValidations;
}

export function checkNPCUsages(mod: IModKit) {
  const npcValidations: ValidationMessageGroup = {
    header: `Unused NPCs`,
    messages: [],
  };

  // item count tracker
  const itemCounts: Record<string, number> = {};

  const addItemCount = (itemName: string) => {
    if (itemCounts[itemName] >= 0) {
      itemCounts[itemName]++;
    }
  };

  mod.npcs.forEach((item) => {
    itemCounts[item.npcId] = 0;
  });

  mod.spawners.forEach((spawner) => {
    spawner.npcIds.forEach((npcId) => {
      addItemCount(npcId.result);
    });
  });

  mod.quests.forEach((quest) => {
    quest.requirements.npcIds.forEach((npcId) => {
      addItemCount(npcId);
    });
  });

  mod.maps.forEach((map) => {
    map.map.layers[10].objects.forEach((spawner: any) => {
      if (spawner.properties.lairName) {
        addItemCount(spawner.properties.lairName as string);
      }
    });
  });

  Object.keys(itemCounts).forEach((item) => {
    if (itemCounts[item] > 0) return;

    npcValidations.messages.push({
      type: 'warning',
      message: `${item} is unused.`,
    });
  });

  if (npcValidations.messages.length === 0) {
    npcValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return npcValidations;
}

export function checkNPCSprites(mod: IModKit) {
  const npcValidations: ValidationMessageGroup = {
    header: `NPCs`,
    messages: [],
  };

  mod.npcs.forEach((item) => {
    item.sprite.forEach((sprite) => {
      if (sprite % 5 === 0) return;

      npcValidations.messages.push({
        type: 'error',
        message: `NPC ${item.npcId} has an invalid sprite: ${sprite} - it should be modulo 5.`,
      });
    });
  });

  if (npcValidations.messages.length === 0) {
    npcValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return npcValidations;
}
