import { IRecipe, TradeskillType } from '../../interfaces';
import { id } from './id';

export const defaultRecipe: () => IRecipe = () => ({
  _id: id(),
  category: '',
  item: '',
  maxSkillForGains: 0,
  name: '',
  recipeType: undefined as unknown as TradeskillType,
  requireSkill: 0,
  skillGained: 1,
  xpGained: 1,
  copySkillToPotency: false,
  ingredients: [],
  ozIngredients: [],
  potencyScalar: 0,
  requireClass: [],
  requireLearn: false,
  requireSpell: undefined as unknown as string,
  transferOwnerFrom: '',
});
