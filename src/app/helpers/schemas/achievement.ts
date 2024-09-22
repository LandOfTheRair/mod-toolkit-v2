import { isBoolean, isNumber, isObject, isString } from 'lodash';
import { Schema } from '../../../interfaces';
import { isBaseClass, isSkill, isTradeskill } from './_helpers';

export const achievementSchema: Schema = [
  ['ap', true, isNumber],
  ['desc', true, isString],
  ['name', true, isString],
  ['hidden', false, isBoolean],
  ['shareWithParty', false, isBoolean],

  ['activationType', true, isString],

  ['icon', true, isString],
  ['iconColor', true, isString],
  ['iconBgColor', true, isString],
  ['iconBorderColor', true, isString],

  ['requirements', true, isObject],

  ['requirements.bindItem', true, isObject],
  ['requirements.bindItem.item', false, isString],

  ['requirements.kill', true, isObject],
  ['requirements.kill.npc', false, isString],

  ['requirements.level', true, isObject],
  ['requirements.level.baseClass', false, isBaseClass],
  ['requirements.level.level', false, isNumber],

  ['requirements.skill', true, isObject],
  ['requirements.skill.skill', false, isSkill],
  ['requirements.skill.level', false, isNumber],

  ['requirements.tradeskill', true, isObject],
  ['requirements.tradeskill.skill', false, isTradeskill],
  ['requirements.tradeskill.level', false, isNumber],
];
