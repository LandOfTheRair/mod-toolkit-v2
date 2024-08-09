import { BaseClass, TradeskillType } from './building-blocks';
import { HasIdentification } from './identified';

export interface IRecipe extends HasIdentification {
  recipeType: TradeskillType;
  item: string;
  name: string;
  category: string;
  requireSkill: number;
  requireLearn?: boolean;
  requireClass?: BaseClass[];
  requireSpell?: string;
  copySkillToPotency?: boolean;
  potencyScalar?: number;
  skillGained: number;
  maxSkillForGains: number;
  xpGained: number;
  ingredients?: string[];
  ozIngredients?: Array<{ filter: string; display: string; ounces: number }>;
  transferOwnerFrom?: string;
}
