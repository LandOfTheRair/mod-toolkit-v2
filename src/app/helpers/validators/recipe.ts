import { IModKit, ValidationMessageGroup } from '../../../interfaces';

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

  if (itemValidations.messages.length === 0) {
    itemValidations.messages.push({
      type: 'good',
      message: 'No abnormalities!',
    });
  }

  return itemValidations;
}
