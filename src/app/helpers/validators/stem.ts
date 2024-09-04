import {
  IModKit,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { ISTEM } from '../../../interfaces/stem';
import { validateSchema } from '../schemas/_helpers';
import { stemSchema } from '../schemas/stem';

export function validateSTEMs(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid STEMs',
    messages: [],
  };

  mod.stems.forEach((item) => {
    const failures = validateSchema<ISTEM>(item._gameId, item, stemSchema);
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}

export function validateSTEMProperties(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Awkward STEM Properties',
    messages: [],
  };

  mod.stems.forEach((item) => {
    if (
      item.spell?.spellMeta?.linkedEffectName &&
      item.spell.spellMeta.linkedEffectName !== item._gameId
    ) {
      itemValidations.messages.push({
        type: 'warning',
        message: `STEM ${item._gameId} has a spell that references ${item.spell.spellMeta.linkedEffectName}, which is not ${item._gameId}`,
      });
    }
  });

  return itemValidations;
}
