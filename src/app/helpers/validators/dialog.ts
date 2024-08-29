import {
  BaseClassType,
  IModKit,
  INPCScript,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { extractAllItemsFromDialog } from '../data';
import { dialogSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function checkMapNPCDialogs(mod: IModKit): ValidationMessageGroup {
  // check npc dialog refs, make sure they exist
  const mapDialogValidations: ValidationMessageGroup = {
    header: `Unused NPC Scripts`,
    messages: [],
  };

  const foundDialogs: Record<string, number> = {};

  const addDialogCount = (item: string) => {
    foundDialogs[item] ??= 0;
    foundDialogs[item]++;
  };

  mod.maps.forEach((map) => {
    map.map.layers[9].objects.forEach((npc: any) => {
      addDialogCount(npc.properties.tag as string);
    });
  });

  mod.dialogs.forEach((dia) => {
    if (foundDialogs[dia.tag]) return;

    mapDialogValidations.messages.push({
      type: 'warning',
      message: `${dia.tag} is unused.`,
    });
  });

  return mapDialogValidations;
}

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

export function validateDialogsItems(
  mod: IModKit,
  validClasses: BaseClassType[]
): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'NPC Script Broken Item Refs',
    messages: [],
  };

  mod.dialogs.forEach((item) => {
    const extractedItems = extractAllItemsFromDialog(item, validClasses);

    extractedItems.forEach((itemName) => {
      const itemRef = mod.items.find((i) => i.name.includes(itemName));
      if (!itemRef) {
        itemValidations.messages.push({
          type: 'error',
          message: `Item ${itemName} referenced in dialog ${item.tag} does not exist.`,
        });
      }
    });
  });

  return itemValidations;
}
