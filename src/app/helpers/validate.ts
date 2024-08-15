import { sortBy } from 'lodash';
import { IModKit, ValidationMessageGroup } from '../../interfaces';
import {
  checkItemStats,
  checkItemUses,
  checkMapNPCDialogs,
  checkMapProperties,
  checkMapSpawners,
  checkNPCs,
  checkNPCUsages,
  checkQuests,
  checkRecipes,
  checkSpawners,
  validateDialogs,
  validateDroptables,
  validateItems,
  validateNPCs,
  validateQuests,
  validateRecipes,
  validateSpawners,
} from './validators';

export function validationMessagesForMod(
  mod: IModKit
): ValidationMessageGroup[] {
  const validationContainer: ValidationMessageGroup[] = [
    checkItemStats(mod),
    checkItemUses(mod),
    checkMapNPCDialogs(mod),
    checkNPCUsages(mod),
    checkNPCs(mod),
    checkRecipes(mod),
    checkSpawners(mod),
    checkQuests(mod),
    ...checkMapProperties(mod),
    ...checkMapSpawners(mod),
    validateDialogs(mod),
    validateItems(mod),
    validateDroptables(mod),
    validateNPCs(mod),
    validateQuests(mod),
    validateRecipes(mod),
    validateSpawners(mod),
  ].filter((c) => c.messages.length > 0);

  return sortBy(validationContainer, 'header');
}

export function numErrorsForMod(mod: IModKit): number {
  const validationMessages = validationMessagesForMod(mod);

  const numErrors = validationMessages
    .map((v) => v.messages)
    .flat()
    .filter((vdn) => vdn.type === 'error').length;

  return numErrors;
}
