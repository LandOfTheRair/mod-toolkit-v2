import {
  IModKit,
  IQuest,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { questSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function checkQuests(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: `Quests`,
    messages: [],
  };

  mod.quests.forEach((quest) => {
    if (quest.rewards.length === 0) {
      itemValidations.messages.push({
        type: 'warning',
        message: `Quest ${quest.name} does not have any rewards.`,
      });
    }
  });

  return itemValidations;
}

export function validateQuests(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Quests',
    messages: [],
  };

  mod.quests.forEach((item) => {
    const failures = validateSchema<IQuest>(item.name, item, questSchema);
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
