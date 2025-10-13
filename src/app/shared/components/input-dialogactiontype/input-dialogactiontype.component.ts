import { Component, computed, model, output } from '@angular/core';
import { sortBy } from 'lodash';
import { DialogActionType } from '../../../../interfaces';

@Component({
  selector: 'app-input-dialogactiontype',
  standalone: false,
  templateUrl: './input-dialogactiontype.component.html',
  styleUrl: './input-dialogactiontype.component.scss',
})
export class InputDialogactiontypeComponent {
  public dialogType = model.required<DialogActionType>();
  public change = output<DialogActionType>();

  public values = computed(() => {
    const descriptions: Record<DialogActionType, string> = {
      [DialogActionType.AddUpgradeItem]: 'Add an upgrade item to an item',
      [DialogActionType.Chat]: 'Display a chat message to the player',
      [DialogActionType.CheckAnyHostilesNearby]:
        'Check for any hostiles nearby',
      [DialogActionType.CheckDailyQuest]:
        'Check if the player has a specific daily quest',
      [DialogActionType.CheckEffect]:
        'Check if the player has a specific effect',
      [DialogActionType.CheckHoliday]: 'Check if a specific holiday is active',
      [DialogActionType.CheckItem]: 'Check if the player has a specific item',
      [DialogActionType.CheckItemCanUpgrade]:
        'Check if an item can be upgraded',
      [DialogActionType.CheckLevel]: 'Check the player level',
      [DialogActionType.CheckNoItem]:
        'Check if the player is not holding any items',
      [DialogActionType.CheckNPCsAndDropItems]:
        'Check nearby NPCs and drop items based on the # of them alive (then remove the NPCs)',
      [DialogActionType.CheckQuest]: 'Check the status of a quest',
      [DialogActionType.DropItems]: 'Drop items onto the ground',
      [DialogActionType.GiveCurrency]: 'Give currency to the player',
      [DialogActionType.GiveDailyQuest]: 'Give a daily quest to the player',
      [DialogActionType.GiveEffect]: 'Give an effect to the player',
      [DialogActionType.GiveItem]: 'Give an item to the player',
      [DialogActionType.GiveQuest]: 'Give a quest to the player',
      [DialogActionType.GiveSelfEffect]: 'Apply an effect to the dialog NPC',
      [DialogActionType.GrantAchievement]: 'Grant an achievement to the player',
      [DialogActionType.HasQuest]: 'Check if the player has a specific quest',
      [DialogActionType.KillSelfSilently]: 'Remove the NPC silently',
      [DialogActionType.MergeAndGiveItem]: 'Merge items and give to the player',
      [DialogActionType.ModifyItem]: 'Modify an item in the player hands',
      [DialogActionType.TakeItem]: 'Take an item from the player',
      [DialogActionType.UpdateQuest]: 'Update the status of a quest',
    };

    return sortBy(Object.values(DialogActionType)).map((value) => ({
      value,
      desc: descriptions[value as DialogActionType],
    }));
  });
}
