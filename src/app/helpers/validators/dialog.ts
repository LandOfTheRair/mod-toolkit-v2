import {
  IModKit,
  INPCScript,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { dialogSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function validateDialogs(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid NPC Scripts',
    messages: [],
  };

  mod.dialogs.forEach((item) => {
    const failures = validateSchema<INPCScript>(item.tag, item, dialogSchema);
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
