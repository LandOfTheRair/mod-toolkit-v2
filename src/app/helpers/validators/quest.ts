import { IModKit, ValidationMessageGroup } from '../../../interfaces';

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

  if (itemValidations.messages.length === 0) {
    itemValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return itemValidations;
}
