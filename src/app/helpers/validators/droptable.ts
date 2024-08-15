import {
  IDroptable,
  IModKit,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { droptableSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function validateDroptables(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Droptables',
    messages: [],
  };

  mod.drops.forEach((item) => {
    const failures = validateSchema<IDroptable>(
      item.mapName || item.regionName || 'Global',
      item,
      droptableSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
