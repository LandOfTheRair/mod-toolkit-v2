import { get } from 'lodash';
import {
  IItemDefinition,
  IModKit,
  ItemSlotType,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { formatItems } from '../export';
import { itemSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function checkItemStats(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Awkward Item Stats & Settings',
    messages: [],
  };

  mod.items.forEach((item) => {
    const modsActionSpeed =
      get(item, 'randomStats.actionSpeed') || get(item, 'stats.actionSpeed');
    if (modsActionSpeed) {
      itemValidations.messages.push({
        type: 'warning',
        message: `${item.name} modifies actionSpeed.`,
      });
    }

    const destroysOnDrop = get(item, 'destroyOnDrop');
    if (destroysOnDrop) {
      itemValidations.messages.push({
        type: 'warning',
        message: `${item.name} destroys on drop.`,
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

export function checkItemUses(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Unused Items',
    messages: [],
  };

  // item count tracker
  const itemCounts: Record<string, number> = {};

  const addItemCount = (itemName: string) => {
    if (itemCounts[itemName] >= 0) {
      itemCounts[itemName]++;
    }
  };

  mod.items.forEach((item) => {
    itemCounts[item.name] = 0;
  });

  // count item usages by type
  mod.drops.forEach((droptable) => {
    droptable.drops.forEach((drop) => {
      addItemCount(drop.result);
    });
  });

  mod.recipes.forEach((recipe) => {
    addItemCount(recipe.item);

    (recipe.ingredients || []).forEach((ing) => {
      addItemCount(ing);
    });
  });

  mod.npcs.forEach((npc) => {
    npc.items.sack.forEach((item) => {
      addItemCount(item.result);
    });

    Object.keys(npc.items.equipment || {}).forEach((slot) => {
      (npc.items.equipment[slot as ItemSlotType] || []).forEach((item) => {
        addItemCount(item.result);
      });
    });

    if (npc.tansFor) {
      addItemCount(npc.tansFor);
    }

    npc.drops.forEach((item) => {
      addItemCount(item.result);
    });

    npc.dropPool.items.forEach((item) => {
      addItemCount(item.result);
    });
  });

  Object.keys(itemCounts).forEach((item) => {
    if (itemCounts[item] > 0) return;

    itemValidations.messages.push({
      type: 'warning',
      message: `${item} is unused.`,
    });
  });

  if (itemValidations.messages.length === 0) {
    itemValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return itemValidations;
}

export function validateItems(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Items',
    messages: [],
  };

  const formattedItems = formatItems(mod.items);

  formattedItems.forEach((item) => {
    const failures = validateSchema<IItemDefinition>(
      item.name,
      item,
      itemSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}
