import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';

export const questSchema: Schema = [
  ['name', true, isString],
  ['giver', true, isString],
  ['desc', true, isString],

  ['isDaily', false, isBoolean],
  ['isRepeatable', false, isBoolean],

  ['messages', false, isObject],
  ['messages.kill', false, isString],
  ['messages.complete', false, isString],
  ['messages.incomplete', false, isString],
  ['messages.alreadyHas', false, isString],
  ['messages.permComplete', false, isString],

  ['requirements', false, isObject],
  ['requirements.type', false, isString],
  ['requirements.npcIds', false, isArray],
  ['requirements.item', false, isString],
  ['requirements.fromHands', false, isBoolean],
  ['requirements.fromSack', false, isBoolean],
  ['requirements.killsRequired', false, isNumber],
  ['requirements.countRequired', false, isNumber],
  ['requirements.itemssRequired', false, isNumber],

  ['rewards', false, isArray],
];
