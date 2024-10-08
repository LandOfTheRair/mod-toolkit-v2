import {
  BaseClassType,
  IModKit,
  ITraitTree,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { traitTreeSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function validateTraitTrees(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Trait Trees',
    messages: [],
  };

  mod.traitTrees.forEach((item) => {
    const failures = validateSchema<ITraitTree>(
      item.name,
      item,
      traitTreeSchema
    );
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}

export function validateTraitTreeData(
  mod: IModKit,
  validClasses: BaseClassType[]
): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Trait Trees',
    messages: [],
  };

  validClasses.forEach((baseClass) => {
    if (mod.traitTrees.some((t) => t.name === baseClass)) return;
    if (baseClass === 'Traveller') return;

    itemValidations.messages.push({
      type: 'error',
      message: `Class ${baseClass} does not have a corresponding trait tree.`,
    });
  });

  mod.traitTrees.forEach((tree) => {
    tree.data.treeOrder.forEach((treeName) => {
      const treeData = tree.data.trees[treeName];
      treeData.tree.forEach((row) => {
        if (row.traits.length < 5) {
          itemValidations.messages.push({
            type: 'error',
            message: `Tree ${treeName} has a row with less than 5 entries.`,
          });
        }

        row.traits.forEach((traitData) => {
          if (traitData.name && traitData.maxLevel < 1) {
            itemValidations.messages.push({
              type: 'error',
              message: `Tree ${treeName} uses a trait ${traitData.name} that does not have a correct max level.`,
            });
          }

          if (
            traitData.requires &&
            !mod.stems.some((s) => s._gameId === traitData.requires)
          ) {
            itemValidations.messages.push({
              type: 'error',
              message: `Tree ${treeName} requires a trait ${traitData.requires} that does not exist.`,
            });
          }
        });
      });
    });
  });

  return itemValidations;
}
