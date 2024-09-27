import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import { DialogActionType, Schema } from '../../../interfaces';
import {
  is,
  isAny,
  isArrayOf,
  isCurrency,
  isDialogChatOption,
  isDialogItem,
  isDialogItemSlot,
  isHoliday,
} from './_helpers';

export const dialogBehaviorSchemas: Record<DialogActionType, Schema> = {
  [DialogActionType.Chat]: [
    ['type', true, is('chat')],
    ['displayNPCSprite', false, isNumber],
    ['displayNPCName', false, isString],
    ['displayNPCUUID', false, isString],
    ['displayItemName', false, isString],
    ['displayNPCSprite', false, isNumber],
    ['displayTitle', false, isString],
    ['maxDistance', false, isNumber],
    ['message', true, isString],
    ['width', false, isString],
    ['extraClasses', false, isArrayOf(isString)],
    ['options', false, isArrayOf(isDialogChatOption)],
  ],
  [DialogActionType.CheckItem]: [
    ['type', true, is('checkItem')],
    ['fromHands', false, isBoolean],
    ['fromSack', false, isBoolean],
    ['checkProperty', false, isString],
    ['checkValue', false, isAny],
    ['slot', true, isDialogItemSlot],
    ['item', true, isDialogItem],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.CheckNoItem]: [
    ['type', true, is('checkNoItem')],
    ['fromHands', false, isBoolean],
    ['slot', true, isArrayOf(isDialogItemSlot)],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.TakeItem]: [
    ['type', true, is('takeItem')],
    ['slot', true, isDialogItemSlot],
    ['fromHands', false, isBoolean],
    ['item', true, isDialogItem],
  ],
  [DialogActionType.GiveItem]: [
    ['type', true, is('giveItem')],
    ['slot', true, isDialogItemSlot],
    ['item', true, isDialogItem],
  ],
  [DialogActionType.MergeAndGiveItem]: [
    ['type', true, is('mergeAndGiveItem')],
    ['slot', true, isDialogItemSlot],
    ['item', true, isDialogItem],
  ],
  [DialogActionType.ModifyItem]: [
    ['type', true, is('modifyItem')],
    ['slot', true, isArrayOf(isDialogItemSlot)],
    ['item', false, isDialogItem],
    ['mods', true, isObject],
  ],
  [DialogActionType.CheckItemCanUpgrade]: [
    ['type', true, is('checkItemCanUpgrade')],
    ['slot', true, isDialogItemSlot],
    ['upgrade', false, isString],
    ['fromHands', false, isBoolean],
    ['item', false, isDialogItem],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.AddUpgradeItem]: [
    ['type', true, is('addItemUpgrade')],
    ['slot', true, isDialogItemSlot],
    ['upgrade', false, isString],
  ],
  [DialogActionType.GiveEffect]: [
    ['type', true, is('giveEffect')],
    ['effect', true, isString],
    ['duration', true, isNumber],
  ],
  [DialogActionType.GiveCurrency]: [
    ['type', true, is('giveCurrency')],
    ['currency', true, isCurrency],
    ['amount', true, isNumber],
  ],
  [DialogActionType.CheckQuest]: [
    ['type', true, is('checkQuest')],
    ['quest', true, isString],
    ['maxDistance', false, isNumber],
    ['questCompleteActions', false, isArray],
  ],
  [DialogActionType.UpdateQuest]: [
    ['type', true, is('updateQuest')],
    ['quest', true, isString],
    ['maxDistance', false, isNumber],
    ['arrayItem', false, isString],
  ],
  [DialogActionType.CheckHoliday]: [
    ['type', true, is('checkHoliday')],
    ['holiday', true, isHoliday],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.CheckDailyQuest]: [
    ['type', true, is('checkDailyQuest')],
    ['quests', true, isArrayOf(isString)],
    ['npc', true, isString],
    ['maxDistance', false, isNumber],
  ],
  [DialogActionType.GiveQuest]: [
    ['type', true, is('giveQuest')],
    ['quest', true, isString],
    ['maxDistance', false, isNumber],
  ],
  [DialogActionType.HasQuest]: [
    ['type', true, is('hasQuest')],
    ['quest', true, isString],
    ['maxDistance', false, isNumber],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.GiveDailyQuest]: [
    ['type', true, is('giveDailyQuest')],
    ['quests', true, isArrayOf(isString)],
    ['maxDistance', false, isNumber],
  ],
  [DialogActionType.CheckLevel]: [
    ['type', true, is('checkLevel')],
    ['level', true, isNumber],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.CheckAlignment]: [
    ['type', true, is('checkAlignment')],
    ['alignment', true, isString],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.SetAlignment]: [
    ['type', true, is('setAlignment')],
    ['alignment', true, isString],
  ],
  [DialogActionType.CheckNPCsAndDropItems]: [
    ['type', true, is('checkNearbyNPCsAndDropItems')],
    ['npcs', true, isArrayOf(isString)],
    ['item', true, isString],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.CheckAnyHostilesNearby]: [
    ['type', true, is('checkAnyHostilesNearby')],
    ['range', true, isNumber],
    ['checkFailActions', false, isArray],
    ['checkPassActions', true, isArray],
  ],
  [DialogActionType.DropItems]: [
    ['type', true, is('dropItems')],
    ['item', true, isString],
    ['amount', true, isNumber],
  ],
  [DialogActionType.KillSelfSilently]: [
    ['type', true, is('killSelfSilently')],
    ['leaveMessage', false, isString],
  ],
  [DialogActionType.GrantAchievement]: [
    ['type', true, is('grantAchievement')],
    ['achievementName', true, isString],
  ],
};
