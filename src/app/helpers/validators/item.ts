import { get, groupBy } from 'lodash';
import {
  BaseClassType,
  IItemDefinition,
  IModKit,
  ItemSlot,
  ItemSlotType,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { extractAllItemsFromDialog } from '../data';
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

  return itemValidations;
}

export function checkItemDescriptions(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Duplicate Item Descriptions',
    messages: [],
  };

  const itemDescs: Record<string, string> = {};
  const itemExtendedDescs: Record<string, string> = {};

  mod.items.forEach((item) => {
    if (!item.desc) return;

    if (
      item.name.includes('Orikurnis') ||
      item.name.includes('Solokar') ||
      item.name.includes('Enemy')
    )
      return;

    // if the description matches
    const descMatch = itemDescs[item.desc];
    if (descMatch) {
      // if there's an extended desc
      if (item.extendedDesc) {
        // ... and the extended desc matches, it's an error - they can't both be the same
        if (
          itemExtendedDescs[item.extendedDesc] &&
          descMatch === itemExtendedDescs[item.extendedDesc]
        ) {
          itemValidations.messages.push({
            type: 'error',
            message: `${item.name} and ${
              itemExtendedDescs[item.extendedDesc]
            } share the same extended description AND description.`,
          });
          return;

          // ... but if the extended desc doesn't match, it's just a warning
        } else {
          itemValidations.messages.push({
            type: 'warning',
            message: `${item.name} and ${
              itemDescs[item.desc]
            } share the same description but NOT the same extended description.`,
          });
          return;
        }
      }

      // if there is no extended desc, it's an error - they should not have the same desc
      itemValidations.messages.push({
        type: 'error',
        message: `${item.name} and ${
          itemDescs[item.desc]
        } share the same description.`,
      });

      return;
    }

    itemDescs[item.desc] = item.name;
    if (item.extendedDesc) {
      itemExtendedDescs[item.extendedDesc] = item.name;
    }
  });

  return itemValidations;
}

export function checkItemUses(
  mod: IModKit,
  validClasses: BaseClassType[],
): ValidationMessageGroup {
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
    npc.items?.sack?.forEach((item) => {
      addItemCount(item.result);
    });

    Object.keys(npc.items?.equipment ?? {}).forEach((slot) => {
      (npc.items.equipment[slot as ItemSlotType] || []).forEach((item) => {
        addItemCount(item.result);
      });
    });

    if (npc.tansFor) {
      addItemCount(npc.tansFor);
    }

    npc.drops?.forEach((item) => {
      addItemCount(item.result);
    });

    npc.dropPool?.items.forEach((item) => {
      addItemCount(item.result);
    });
  });

  mod.dialogs.forEach((dialog) => {
    Object.keys(dialog.items?.equipment ?? {}).forEach((slot) => {
      if (!dialog.items.equipment[slot as ItemSlot]) return;

      addItemCount(dialog.items.equipment[slot as ItemSlot]);
    });

    Object.keys(itemCounts).forEach((item) => {
      if (itemCounts[item] > 0) return;

      const dialogText = JSON.stringify(dialog.dialog ?? {});
      const dialogBehavior = JSON.stringify(dialog.behaviors ?? {});

      if (dialogText.includes(item) || dialogBehavior.includes(item)) {
        addItemCount(item);
      }
    });

    const dialogItems = extractAllItemsFromDialog(dialog, validClasses);
    dialogItems.forEach((item) => {
      addItemCount(item);
    });
  });

  Object.keys(itemCounts)
    .sort()
    .forEach((item) => {
      if (itemCounts[item] > 0) return;

      // autogenerated items dont count against warnings
      if (
        item.includes('Lore Scroll') ||
        item.includes('Rune Scroll') ||
        item.includes('Solokar') ||
        item.includes('Orikurnis') ||
        item.includes('Avatar') ||
        item.includes('Bandit Cave') ||
        item.includes('Conjured') ||
        item.includes('Enemy')
      )
        return;

      itemValidations.messages.push({
        type: 'warning',
        message: `${item} is unused.`,
      });
    });

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
      itemSchema,
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}

export function nonexistentItems(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Non-Existent Items',
    messages: [],
  };

  const allItemNames = groupBy(mod.items, 'name');
  allItemNames['none'] = {} as any;

  mod.items.forEach((item) => {
    item.containedItems?.forEach((checkRollable) => {
      if (allItemNames[checkRollable.result]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${checkRollable.result} ([item] ${item.name} -> containedItems) does not exist.`,
      });
    });
  });

  mod.npcs.forEach((npc) => {
    npc.items?.sack?.forEach((checkRollable) => {
      if (allItemNames[checkRollable.result]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${checkRollable.result} ([npc] ${npc.npcId} -> sack) does not exist.`,
      });
    });

    Object.keys(npc.items?.equipment ?? {}).forEach((itemslot) => {
      npc.items.equipment[itemslot as ItemSlotType]?.forEach(
        (checkRollable) => {
          if (allItemNames[checkRollable.result]) return;

          itemValidations.messages.push({
            type: 'error',
            message: `${checkRollable.result} ([npc] ${npc.npcId} -> ${itemslot}) does not exist.`,
          });
        },
      );
    });

    npc.drops?.forEach((checkRollable) => {
      if (allItemNames[checkRollable.result]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${checkRollable.result} ([npc] ${npc.npcId} -> drops) does not exist.`,
      });
    });

    npc.dropPool?.items?.forEach((checkRollable) => {
      if (allItemNames[checkRollable.result]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${checkRollable.result} ([npc] ${npc.npcId} -> dropPool) does not exist.`,
      });
    });
  });

  mod.drops.forEach((droptable) => {
    droptable.drops.forEach((checkRollable) => {
      if (allItemNames[checkRollable.result]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${checkRollable.result} ([droptable] ${
          droptable.mapName || droptable.regionName || 'global drops'
        }) does not exist.`,
      });
    });
  });

  mod.recipes.forEach((recipe) => {
    if (!allItemNames[recipe.item]) {
      itemValidations.messages.push({
        type: 'error',
        message: `${recipe.item} (${recipe.name}) does not exist.`,
      });
    }

    if (recipe.transferOwnerFrom && !allItemNames[recipe.transferOwnerFrom]) {
      itemValidations.messages.push({
        type: 'error',
        message: `${recipe.transferOwnerFrom} ([recipe] ${recipe.name}) does not exist.`,
      });
    }

    recipe.ingredients?.forEach((ing) => {
      if (ing && allItemNames[ing]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${ing} ([recipe] ${recipe.name}) does not exist.`,
      });
    });

    recipe.ozIngredients?.forEach((ing) => {
      if (ing && allItemNames[ing.display]) return;

      itemValidations.messages.push({
        type: 'error',
        message: `${ing.display} ([recipe] ${recipe.name}) does not exist.`,
      });
    });
  });

  return itemValidations;
}
