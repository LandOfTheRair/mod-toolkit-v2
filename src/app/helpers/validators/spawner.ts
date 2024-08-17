import {
  IModKit,
  ISpawnerData,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { spawnerSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

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

    if (!spawner.npcAISettings?.includes('default')) {
      itemValidations.messages.push({
        type: 'warning',
        message: `Spawner ${spawner.tag} does not have the default AI setting.`,
      });
    }
  });

  return itemValidations;
}

export function validateSpawners(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Spawners',
    messages: [],
  };

  mod.spawners.forEach((item) => {
    const failures = validateSchema<ISpawnerData>(
      item.tag,
      item,
      spawnerSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
