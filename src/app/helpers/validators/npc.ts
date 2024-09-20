import { groupBy } from 'lodash';
import {
  IModKit,
  INPCDefinition,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { formatNPCs } from '../export';
import { npcSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

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
    quest.requirements.npcIds?.forEach((npcId) => {
      addItemCount(npcId);
    });
  });

  mod.maps.forEach((map) => {
    map.map.layers[10].objects.forEach((spawner: any) => {
      if (spawner.properties?.lairName) {
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

  return npcValidations;
}

export function checkNPCs(mod: IModKit) {
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

    if (item.forceAI) {
      npcValidations.messages.push({
        type: 'warning',
        message: `NPC ${item.npcId} sets forceAI to ${item.forceAI}.`,
      });
    }
  });

  return npcValidations;
}

export function validateNPCs(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid NPCs',
    messages: [],
  };

  const formattedNPCs = formatNPCs(mod.npcs);

  formattedNPCs.forEach((item) => {
    const failures = validateSchema<INPCDefinition>(
      item.npcId,
      item,
      npcSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}

export function nonexistentNPCs(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Non-Existent NPCs',
    messages: [],
  };

  const allNPCIds = groupBy(mod.npcs, 'npcId');

  mod.spawners.forEach((spawner) => {
    spawner.npcIds.forEach((checkRollable) => {
      if (allNPCIds[checkRollable.result]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${checkRollable.result} ([spawner] ${spawner.tag} -> npcIds) does not exist.`,
      });
    });
  });

  mod.quests.forEach((quest) => {
    quest.requirements.npcIds?.forEach((npcId) => {
      if (allNPCIds[npcId]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${npcId} ([quest] ${quest.name} -> requirements.npcIds) does not exist.`,
      });
    });
  });

  return itemValidations;
}
