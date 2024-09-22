import {
  IAchievement,
  IModKit,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { achievementSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function validateAchievements(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Achievements',
    messages: [],
  };

  mod.achievements.forEach((item) => {
    const failures = validateSchema<IAchievement>(
      item.name,
      item,
      achievementSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
