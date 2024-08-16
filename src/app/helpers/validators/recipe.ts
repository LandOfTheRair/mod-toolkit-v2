import { groupBy } from 'lodash';
import {
  IModKit,
  IRecipe,
  ValidationMessage,
  ValidationMessageGroup,
} from '../../../interfaces';
import { recipeSchema } from '../schemas';
import { validateSchema } from '../schemas/_helpers';

export function checkRecipes(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: `Recipes`,
    messages: [],
  };

  mod.recipes.forEach((recipe) => {
    if (recipe.maxSkillForGains === recipe.requireSkill) {
      itemValidations.messages.push({
        type: 'warning',
        message: `Recipe ${recipe.name} (${recipe.category}) has max and min skill set to the same value.`,
      });
    }

    if (
      recipe.transferOwnerFrom &&
      !recipe.ingredients?.includes(recipe.transferOwnerFrom)
    ) {
      itemValidations.messages.push({
        type: 'error',
        message: `Recipe ${recipe.name} (${recipe.category}) has a transferOwnerFrom but no ingredient that matches.`,
      });
    }

    if (recipe.copySkillToPotency && !recipe.potencyScalar) {
      itemValidations.messages.push({
        type: 'warning',
        message: `Recipe ${recipe.name} (${recipe.category}) has copySkillToPotency set, but no potency scalar.`,
      });
    }
  });

  return itemValidations;
}

export function validateRecipes(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Invalid Recipes',
    messages: [],
  };

  mod.recipes.forEach((item) => {
    const failures = validateSchema<IRecipe>(item.name, item, recipeSchema);
    const validationFailures: ValidationMessage[] = failures.map((f) => ({
      type: 'error',
      message: f,
    }));
    itemValidations.messages.push(...validationFailures);
  });

  return itemValidations;
}

export function nonexistentRecipes(mod: IModKit): ValidationMessageGroup {
  const itemValidations: ValidationMessageGroup = {
    header: 'Non-Existent Recipes',
    messages: [],
  };

  const allRecipes = groupBy(mod.recipes, 'name');

  mod.items.forEach((item) => {
    if (!item.recipe) return;
    if (item.recipe && allRecipes[item.recipe]) return;

    itemValidations.messages.push({
      type: 'error',
      message: `${item.recipe} ([item] ${item.name} -> recipe) does not exist.`,
    });
  });

  return itemValidations;
}
