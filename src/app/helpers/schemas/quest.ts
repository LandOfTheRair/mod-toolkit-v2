import { isBoolean, isNumber, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import {
  isArrayOf,
  isItemSlot,
  isObjectWithSome,
  isObjectWithSomeFailure,
  isQuestReward,
} from './_helpers';

const requirementKeys = [
  'type',
  'npcIds',
  'item',
  'fromHands',
  'fromSack',
  'killsRequired',
  'countRequired',
  'itemsRequired',
  'slot',
];

export const questSchema: Schema = [
  ['name', true, isString],
  ['giver', true, isString],
  ['desc', true, isString],

  ['isDaily', false, isBoolean],
  ['isRepeatable', false, isBoolean],

  [
    'messages',
    false,
    isObjectWithSome([
      'kill',
      'complete',
      'incomplete',
      'alreadyHas',
      'permComplete',
    ]),
    isObjectWithSomeFailure([
      'kill',
      'complete',
      'incomplete',
      'alreadyHas',
      'permComplete',
    ]),
  ],
  ['messages.kill', false, isString],
  ['messages.complete', false, isString],
  ['messages.incomplete', false, isString],
  ['messages.alreadyHas', false, isString],
  ['messages.permComplete', false, isString],

  [
    'requirements',
    false,
    isObjectWithSome(requirementKeys),
    isObjectWithSomeFailure(requirementKeys),
  ],
  ['requirements.slot', false, isArrayOf(isItemSlot)],
  ['requirements.type', false, isString],
  ['requirements.npcIds', false, isArrayOf(isString)],
  ['requirements.item', false, isString],
  ['requirements.fromHands', false, isBoolean],
  ['requirements.fromSack', false, isBoolean],
  ['requirements.killsRequired', false, isNumber],
  ['requirements.countRequired', false, isNumber],
  ['requirements.itemsRequired', false, isNumber],

  ['rewards', false, isArrayOf(isQuestReward)],
];
