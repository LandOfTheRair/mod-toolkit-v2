import { IModKit, ValidationMessageGroup } from '../../../interfaces';

export function checkSpawners(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: `Spawners`,
    messages: [],
  };

  mod.spawners.forEach((spawner) => {
    if (spawner.respawnRate < 5) {
      itemValidations.messages.push({
        type: 'warning',
        message: `Spawner ${spawner.tag} has a very fast respawn rate (<5).`,
      });
    }

    if (!spawner.npcAISettings.includes('default')) {
      itemValidations.messages.push({
        type: 'warning',
        message: `Spawner ${spawner.tag} does not have the default AI setting.`,
      });
    }
  });

  if (itemValidations.messages.length === 0) {
    itemValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return itemValidations;
}
