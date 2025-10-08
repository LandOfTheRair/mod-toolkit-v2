import {
  BaseClassType,
  DialogActionType,
  IModKit,
  INPCScript,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import {
  extractAllItemsFromBehavior,
  extractAllItemsFromDialog,
  getAllDialogActions,
} from '../data';
import { dialogBehaviorSchemas, dialogSchema } from '../schemas';
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
      if (!npc.properties?.tag) return;
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

export function validateDialogActions(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid NPC Script Actions',
    messages: [],
  };

  mod.dialogs.forEach((item) => {
    const allActions = getAllDialogActions(item);

    allActions.forEach((action) => {
      const failures = validateSchema<any>(
        `${item.tag}->${action.type}`,
        action,
        dialogBehaviorSchemas[action.type as DialogActionType],
      );
      const validationFailures: ValidationMessage[] = failures.map((f) => ({
        type: 'error',
        message: f,
      }));
      itemValidations.messages.push(...validationFailures);
    });
  });

  return itemValidations;
}

export function validateDialogsItems(
  mod: IModKit,
  validClasses: BaseClassType[],
): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'NPC Script Broken Item Refs',
    messages: [],
  };

  mod.dialogs.forEach((item) => {
    const extractedItemsFromDialog = extractAllItemsFromDialog(
      item,
      validClasses,
    );

    extractedItemsFromDialog.forEach((itemName) => {
      const itemRef = mod.items.find((i) => i.name.includes(itemName));
      if (!itemRef) {
        itemValidations.messages.push({
          type: 'error',
          message: `Item ${itemName} referenced in dialog ${item.tag} does not exist.`,
        });
      }
    });

    const extractedItemsFromBehaviors = extractAllItemsFromBehavior(item);

    extractedItemsFromBehaviors.forEach((itemName) => {
      const itemRef = mod.items.find((i) => i.name === itemName);
      if (!itemRef) {
        itemValidations.messages.push({
          type: 'error',
          message: `Item ${itemName} referenced in behavior ${item.tag} does not exist.`,
        });
      }
    });
  });

  return itemValidations;
}
