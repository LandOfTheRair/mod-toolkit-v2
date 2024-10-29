import {
  IDynamicEventMeta,
  IModKit,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { eventSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function validateEvents(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Events',
    messages: [],
  };

  mod.events.forEach((item) => {
    const failures = validateSchema<IDynamicEventMeta>(
      item.name,
      item,
      eventSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
